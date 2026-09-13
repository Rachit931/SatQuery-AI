from io import BytesIO
from unittest import IsolatedAsyncioTestCase

import httpx
from PIL import Image

from api.main import create_app


DESCRIPTION_QUERY = "What is in this image?"
DETECTION_QUERY = "Find the buildings."
COMPARISON_QUERY = "What changed between these images?"


def image_upload(filename: str = "sample.png") -> tuple[str, bytes, str]:
    """Create a tiny valid image for multipart upload tests."""
    stream = BytesIO()
    Image.new("RGB", (8, 8), "white").save(stream, "PNG")
    return (filename, stream.getvalue(), "image/png")


class QueryRouteTests(IsolatedAsyncioTestCase):
    async def post_query(
        self,
        query: str,
        *,
        include_image2: bool = False,
    ) -> httpx.Response:
        files = {
            "image1": image_upload("image1.png"),
        }

        if include_image2:
            files["image2"] = image_upload("image2.png")

        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=create_app()),
            base_url="http://test",
        ) as client:
            return await client.post(
                "/query",
                data={"query": query},
                files=files,
            )

    async def test_description_query(self):
        response = await self.post_query(DESCRIPTION_QUERY)

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(data["model"], "geochat")
        self.assertTrue(data["answer"])
        self.assertEqual(data["detections"], [])

    async def test_detection_query(self):
        response = await self.post_query(DETECTION_QUERY)

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(data["model"], "grounding_dino")
        self.assertTrue(data["answer"])
        self.assertTrue(data["detections"])

        for detection in data["detections"]:
            self.assertEqual(detection["label"], "building")
            self.assertEqual(len(detection["box"]), 4)
            self.assertGreaterEqual(detection["confidence"], 0.0)
            self.assertLessEqual(detection["confidence"], 1.0)

    async def test_comparison_requires_second_image(self):
        response = await self.post_query(COMPARISON_QUERY)

        self.assertEqual(response.status_code, 422)

        data = response.json()
        self.assertEqual(
            data["detail"],
            "image2 is required for image comparison.",
        )

    async def test_comparison_query(self):
        response = await self.post_query(
            COMPARISON_QUERY,
            include_image2=True,
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(data["model"], "comparison")
        self.assertTrue(data["answer"])
        self.assertIn("differences", data["result"])
        self.assertTrue(data["result"]["differences"])

    async def test_natural_description_variation(self):
        response = await self.post_query("Describe this image")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model"], "geochat")

    async def test_natural_detection_variation(self):
        response = await self.post_query("Show me the buildings")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model"], "grounding_dino")

    async def test_natural_comparison_variation(self):
        response = await self.post_query(
            "Compare these images",
            include_image2=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model"], "comparison")

    async def test_unsupported_query_returns_400(self):
        response = await self.post_query("Tell me the weather")

        self.assertEqual(response.status_code, 400)

        self.assertEqual(
            response.json()["detail"],
            (
                "Unsupported presentation query. Try one of these: "
                "'What is in this image?', "
                "'Find the buildings.', or "
                "'What changed between these images?'"
            ),
        )

    async def test_description_rejects_second_image(self):
        response = await self.post_query(
            DESCRIPTION_QUERY,
            include_image2=True,
        )

        self.assertEqual(response.status_code, 400)

    async def test_detection_rejects_second_image(self):
        response = await self.post_query(
            DETECTION_QUERY,
            include_image2=True,
        )

        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    import unittest

    unittest.main()