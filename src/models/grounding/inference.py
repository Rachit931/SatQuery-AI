"""Adapter around GroundingDINO's bundled inference helpers."""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from threading import Lock

import torch
from PIL import Image

from src.config import PROJECT_ROOT, Settings


class GroundingDinoUnavailableError(RuntimeError):
    pass


class GroundingDinoAdapter:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._lock = Lock()
        self._loaded = False

    def _load(self) -> None:
        if self._loaded:
            return
        if not self._settings.grounding_checkpoint.is_file():
            raise GroundingDinoUnavailableError(f"Grounding DINO checkpoint not found: {self._settings.grounding_checkpoint}")
        if str(PROJECT_ROOT / "GroundingDINO") not in sys.path:
            sys.path.insert(0, str(PROJECT_ROOT / "GroundingDINO"))
        try:
            from groundingdino.util.inference import load_model

            device = self._settings.model_device
            if device.startswith("cuda") and not torch.cuda.is_available():
                device = "cpu"
            self.device = device
            self.model = load_model(
                str(self._settings.grounding_config), str(self._settings.grounding_checkpoint), device=device
            ).to(device)
            self._loaded = True
        except Exception as exc:
            raise GroundingDinoUnavailableError(f"Grounding DINO could not load: {exc}") from exc

    def analyze(
        self, image: Image.Image, caption: str, box_threshold: float = 0.35, text_threshold: float = 0.25
    ) -> dict:
        with self._lock:
            self._load()
            suffix = ".png"
            try:
                from groundingdino.util.inference import load_image, predict

                with tempfile.NamedTemporaryFile(suffix=suffix) as source:
                    image.convert("RGB").save(source.name)
                    _, image_tensor = load_image(source.name)
                boxes, scores, phrases = predict(
                    self.model, image_tensor, caption, box_threshold, text_threshold, device=self.device
                )
                width, height = image.size
                detections = []
                for box, score, label in zip(boxes, scores, phrases):
                    cx, cy, box_width, box_height = [float(value) for value in box.tolist()]
                    detections.append(
                        {
                            "label": label,
                            "confidence": float(score),
                            "box": {
                                "x_min": (cx - box_width / 2) * width,
                                "y_min": (cy - box_height / 2) * height,
                                "x_max": (cx + box_width / 2) * width,
                                "y_max": (cy + box_height / 2) * height,
                            },
                        }
                    )
                return {"detections": detections}
            except GroundingDinoUnavailableError:
                raise
            except Exception as exc:
                raise GroundingDinoUnavailableError(f"Grounding DINO inference failed: {exc}") from exc
