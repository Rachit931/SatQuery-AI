"""Adapter around the GeoChat repository's own model builder and VQA path."""

from __future__ import annotations

from threading import Lock

import torch
from PIL import Image

from src.config import Settings


class GeoChatUnavailableError(RuntimeError):
    pass


class GeoChatAdapter:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._lock = Lock()
        self._loaded = False

    def _load(self) -> None:
        if self._loaded:
            return
        if not self._settings.geochat_checkpoint.is_dir():
            raise GeoChatUnavailableError(f"GeoChat checkpoint not found: {self._settings.geochat_checkpoint}")
        if self._settings.model_device.startswith("cuda") and not torch.cuda.is_available():
            raise GeoChatUnavailableError("GeoChat requires CUDA, but PyTorch reports no available CUDA device.")
        try:
            from geochat.mm_utils import get_model_name_from_path
            from geochat.model.builder import load_pretrained_model

            name = get_model_name_from_path(str(self._settings.geochat_checkpoint))
            self.tokenizer, self.model, self.image_processor, self.context_len = load_pretrained_model(
                str(self._settings.geochat_checkpoint),
                model_base=None,
                model_name=name,
                device=self._settings.model_device,
            )
            self.model.eval()
            self._loaded = True
        except GeoChatUnavailableError:
            raise
        except Exception as exc:
            raise GeoChatUnavailableError(f"GeoChat could not load: {exc}") from exc

    def analyze(self, image: Image.Image, query: str, max_new_tokens: int = 256) -> dict:
        with self._lock:
            self._load()
            try:
                from geochat.constants import DEFAULT_IMAGE_TOKEN, IMAGE_TOKEN_INDEX
                from geochat.conversation import SeparatorStyle, conv_templates
                from geochat.mm_utils import (
                    KeywordsStoppingCriteria,
                    expand2square,
                    tokenizer_image_token,
                )

                conv = conv_templates["llava_v1"].copy()
                image_prompt = DEFAULT_IMAGE_TOKEN + "\n" + query
                conv.append_message(conv.roles[0], image_prompt)
                conv.append_message(conv.roles[1], None)
                prompt = conv.get_prompt()
                input_ids = tokenizer_image_token(
                    prompt, self.tokenizer, IMAGE_TOKEN_INDEX, return_tensors="pt"
                ).unsqueeze(0).to(self.model.device)
                square_image = expand2square(
                    image.convert("RGB"),
                    tuple(int(value * 255) for value in self.image_processor.image_mean),
                )
                image_tensor = self.image_processor.preprocess(
                    square_image,
                    crop_size={"height": 336, "width": 336},
                    size={"shortest_edge": 336},
                    return_tensors="pt",
                )["pixel_values"]
                image_tensor = image_tensor.to(self.model.device, dtype=torch.float16)
                if prompt.count(DEFAULT_IMAGE_TOKEN) != image_tensor.shape[0]:
                    raise ValueError("GeoChat image token count does not match the processed image batch.")
                stop_str = conv.sep if conv.sep_style != SeparatorStyle.TWO else conv.sep2
                stopping = KeywordsStoppingCriteria([stop_str], self.tokenizer, input_ids)
                with torch.inference_mode():
                    output_ids = self.model.generate(
                        input_ids,
                        images=image_tensor,
                        do_sample=False,
                        max_new_tokens=max_new_tokens,
                        num_beams=1,
                        use_cache=True,
                        stopping_criteria=[stopping],
                    )
                answer = self.tokenizer.decode(output_ids[0, input_ids.shape[1] :], skip_special_tokens=True).strip()
                if answer.endswith(stop_str):
                    answer = answer[: -len(stop_str)].strip()
                return {"answer": answer}
            except Exception as exc:
                raise GeoChatUnavailableError(f"GeoChat inference failed: {exc}") from exc
