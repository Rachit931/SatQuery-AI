"""Gemini-only request router; specialist inference never occurs here."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass

from google import genai
from google.genai import types

from src.config import Settings


ALLOWED_MODELS = frozenset({"geochat", "grounding_dino", "changechat"})


class RouterUnavailableError(RuntimeError):
    """Raised when Gemini cannot be used to select a specialist."""


class InvalidRouteError(RuntimeError):
    """Raised when Gemini responds with a route outside the permitted set."""


@dataclass(frozen=True)
class RouteDecision:
    model: str
    rationale: str


class GeminiRouter:
    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.gemini_api_key
        self._model = settings.gemini_model

    def route(self, query: str, image_count: int) -> RouteDecision:
        if not self._api_key:
            raise RouterUnavailableError("GEMINI_API_KEY is not configured.")

        prompt = (
            "Choose the one specialist model that should handle this satellite-image request. "
            "Return JSON only with keys model and rationale. model must be exactly one of "
            "geochat, grounding_dino, changechat. "
            "Use geochat for single-image satellite visual question answering/description; "
            "grounding_dino for locating, counting, or bounding-box detection of named objects; "
            "changechat only for a two-image temporal change request. Do not analyze the image.\n"
            f"image_count: {image_count}\nquery: {query}"
        )
        try:
            client = genai.Client(api_key=self._api_key)
            response = client.models.generate_content(
                model=self._model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0,
                ),
            )
        except Exception as exc:  # provider errors should remain a controlled API response
            raise RouterUnavailableError(f"Gemini routing failed: {exc}") from exc

        try:
            payload = json.loads(response.text or "")
        except (json.JSONDecodeError, ValueError, AttributeError) as exc:
            raise InvalidRouteError("Gemini returned non-JSON routing output.") from exc

        model = payload.get("model") if isinstance(payload, dict) else None
        if not isinstance(model, str) or model not in ALLOWED_MODELS:
            raise InvalidRouteError(f"Gemini returned invalid model route: {model!r}")
        rationale = payload.get("rationale", "")
        return RouteDecision(model=model, rationale=str(rationale).strip()[:500])


def extract_detection_prompt(query: str) -> str:
    """Convert common detector questions to the caption format DINO expects."""
    lowered = query.strip()
    for pattern in (
        r"^(?:find|detect|locate|show|count)\s+(?:all\s+)?",
        r"^(?:where are|where is)\s+(?:the\s+)?",
    ):
        lowered = re.sub(pattern, "", lowered, flags=re.IGNORECASE)
    return lowered.rstrip("?. ") or query.strip()
