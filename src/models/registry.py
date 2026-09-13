"""One lazy adapter instance per API process."""

from __future__ import annotations

from src.config import Settings
from src.models.change.inference import ChangeChatAdapter
from src.models.geochat.inference import GeoChatAdapter
from src.models.grounding.inference import GroundingDinoAdapter


class ModelRegistry:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.geochat = GeoChatAdapter(settings)
        self.grounding_dino = GroundingDinoAdapter(settings)
        self.changechat = ChangeChatAdapter()
