import unittest
from unittest.mock import patch

from src.config import Settings
from src.llm.router import ALLOWED_MODELS, GeminiRouter, InvalidRouteError, extract_detection_prompt


class RouterUtilityTests(unittest.TestCase):
    def test_allowed_models_are_fixed(self):
        self.assertEqual(ALLOWED_MODELS, {"geochat", "grounding_dino", "changechat"})

    def test_detector_prompt_extraction(self):
        self.assertEqual(extract_detection_prompt("Find all ships."), "ships")

    def test_gemini_route_is_validated(self):
        settings = Settings.from_environment()
        settings = Settings(**{**settings.__dict__, "gemini_api_key": "test-key"})
        response = type("Response", (), {"text": '{"model":"grounding_dino","rationale":"boxes"}'})()
        client = type("Client", (), {"models": type("Models", (), {"generate_content": lambda *_args, **_kwargs: response})()})()
        with patch("src.llm.router.genai.Client", return_value=client):
            decision = GeminiRouter(settings).route("Find ships", 1)
        self.assertEqual(decision.model, "grounding_dino")

    def test_invalid_gemini_model_is_rejected(self):
        settings = Settings.from_environment()
        settings = Settings(**{**settings.__dict__, "gemini_api_key": "test-key"})
        response = type("Response", (), {"text": '{"model":"other"}'})()
        client = type("Client", (), {"models": type("Models", (), {"generate_content": lambda *_args, **_kwargs: response})()})()
        with patch("src.llm.router.genai.Client", return_value=client):
            with self.assertRaises(InvalidRouteError):
                GeminiRouter(settings).route("Find ships", 1)
