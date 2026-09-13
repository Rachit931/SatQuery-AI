"""Dispatch a validated Gemini decision to exactly one specialist adapter."""

from __future__ import annotations

from PIL import Image

from api.schemas.common import QueryResponse
from src.llm.router import RouteDecision, extract_detection_prompt
from src.models.registry import ModelRegistry


def run_specialist(
    registry: ModelRegistry, decision: RouteDecision, query: str, image1: Image.Image, image2: Image.Image | None
) -> QueryResponse:
    if decision.model == "geochat":
        outcome = registry.geochat.analyze(image1, query)
        return QueryResponse(model=decision.model, route_rationale=decision.rationale, **outcome)
    if decision.model == "grounding_dino":
        outcome = registry.grounding_dino.analyze(image1, extract_detection_prompt(query))
        return QueryResponse(model=decision.model, route_rationale=decision.rationale, **outcome)
    if decision.model == "changechat":
        if image2 is None:
            raise ValueError("changechat requires image2.")
        outcome = registry.changechat.analyze(image1, image2, query)
        return QueryResponse(model=decision.model, route_rationale=decision.rationale, **outcome)
    raise ValueError(f"Unsupported model decision: {decision.model}")
