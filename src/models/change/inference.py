"""Stable adapter boundary for a future verified ChangeChat/DeltaVLM runtime."""

from __future__ import annotations

from PIL import Image


class ChangeModelUnavailableError(RuntimeError):
    pass


class ChangeChatAdapter:
    available = False

    def analyze(self, image1: Image.Image, image2: Image.Image, query: str) -> dict:
        raise ChangeModelUnavailableError(
            "ChangeChat/DeltaVLM is unavailable: no verified local runtime and checkpoint exist."
        )
