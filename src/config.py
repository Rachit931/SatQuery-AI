"""Runtime configuration for the inference API."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None
    gemini_model: str
    model_device: str
    geochat_checkpoint: Path
    grounding_config: Path
    grounding_checkpoint: Path

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            gemini_model=os.getenv("GEMINI_ROUTER_MODEL", "gemini-2.5-flash"),
            model_device=os.getenv("SATQUERY_DEVICE", "cuda"),
            geochat_checkpoint=PROJECT_ROOT / "models" / "geochat-7B",
            grounding_config=(
                PROJECT_ROOT
                / "GroundingDINO"
                / "groundingdino"
                / "config"
                / "GroundingDINO_SwinT_OGC.py"
            ),
            grounding_checkpoint=(
                PROJECT_ROOT
                / "GroundingDINO"
                / "weights"
                / "groundingdino_swint_ogc.pth"
            ),
        )
