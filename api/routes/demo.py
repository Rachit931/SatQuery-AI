"""Static presentation-only endpoint; performs no image analysis."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile


router = APIRouter(tags=["presentation-demo"])


# ---------------------------------------------------------------------------
# Supported presentation intents
# ---------------------------------------------------------------------------

DESCRIPTION_QUERIES = {
    "what is in this image",
    "what do you see",
    "describe this image",
    "describe the image",
    "analyze this image",
    "analyze the image",
}

DETECTION_QUERIES = {
    "find the buildings",
    "find buildings",
    "detect buildings",
    "show me the buildings",
    "show the buildings",
    "locate the buildings",
    "find all buildings",
}

COMPARISON_QUERIES = {
    "what changed between these images",
    "what changed",
    "compare these images",
    "compare the images",
    "find the differences",
    "what is different",
    "what are the differences",
}


# ---------------------------------------------------------------------------
# Static responses
# ---------------------------------------------------------------------------

DESCRIPTION_RESPONSE = {
    "model": "geochat",
    "answer": (
        "The image shows a predominantly residential area with buildings and "
        "houses arranged along a network of roads. Trees and vegetation are "
        "distributed throughout the properties, while larger structures, "
        "parking areas, and open grassy spaces are also visible."
    ),
    "detections": [],
    "result": None,
    "warnings": ["DEMO_MODE"],
}


DETECTION_RESPONSE = {
    "model": "grounding_dino",
    "answer": (
        "I identified the visible buildings in the satellite image and "
        "marked their approximate locations with bounding boxes."
    ),
    "detections": [
        {
            "label": "building",
            "confidence": 0.95,
            "box": [78, 62, 184, 149],
        },
        {
            "label": "building",
            "confidence": 0.93,
            "box": [211, 74, 326, 173],
        },
        {
            "label": "building",
            "confidence": 0.91,
            "box": [355, 119, 470, 227],
        },
        {
            "label": "building",
            "confidence": 0.89,
            "box": [128, 245, 262, 351],
        },
    ],
    "result": None,
    "warnings": ["DEMO_MODE"],
}


COMPARISON_RESPONSE = {
    "model": "comparison",
    "answer": (
        "The two satellite images show differences in the arrangement and "
        "density of buildings, vegetation, roads, parking areas, and open "
        "spaces. The second image has a denser residential layout with larger "
        "built-up structures, while the first image contains more visible "
        "open green space and a different distribution of vegetation and "
        "buildings."
    ),
    "detections": [],
    "result": {
        "differences": [
            "The arrangement and density of buildings differ between the two images.",
            "The distribution of trees and vegetation differs.",
            "The road and surrounding property layouts differ.",
            "The amount and location of open space differ.",
            "Larger structures and parking areas are positioned differently.",
        ]
    },
    "warnings": ["DEMO_MODE"],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalize_query(query: str) -> str:
    """Normalize user text so simple natural variations can be recognized."""
    return " ".join(query.strip().lower().split())


def classify_query(query: str) -> str | None:
    """
    Classify a short natural-language presentation query.

    Returns:
        "description"
        "detection"
        "comparison"
        None
    """
    normalized = normalize_query(query)

    # Exact common short queries first.
    if normalized in DESCRIPTION_QUERIES:
        return "description"

    if normalized in DETECTION_QUERIES:
        return "detection"

    if normalized in COMPARISON_QUERIES:
        return "comparison"

    # Small amount of natural-language matching so the chat feels normal.
    if (
        "what is in" in normalized
        or "what do you see" in normalized
        or normalized.startswith("describe ")
        or normalized.startswith("analyze ")
    ):
        return "description"

    if (
        "building" in normalized
        and any(
            word in normalized
            for word in (
                "find",
                "detect",
                "show",
                "locate",
            )
        )
    ):
        return "detection"

    if any(
        phrase in normalized
        for phrase in (
            "what changed",
            "compare",
            "difference",
            "different between",
        )
    ):
        return "comparison"

    return None


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/query")
async def query(
    query: str = Form(...),
    image1: UploadFile = File(...),
    image2: UploadFile | None = File(None),
) -> dict[str, object]:
    """
    Presentation-only /query endpoint.

    No image analysis, model inference, LLM calls, or external APIs are used.
    The response is selected from the user's query and image count only.
    """

    intent = classify_query(query)

    # ---------------------------------------------------------------
    # 1. One image -> description
    # ---------------------------------------------------------------
    if intent == "description":
        if image2 is not None:
            raise HTTPException(
                status_code=400,
                detail="The image description query accepts only one image.",
            )

        return DESCRIPTION_RESPONSE

    # ---------------------------------------------------------------
    # 2. One image -> building detection
    # ---------------------------------------------------------------
    if intent == "detection":
        if image2 is not None:
            raise HTTPException(
                status_code=400,
                detail="The building detection query accepts only one image.",
            )

        return DETECTION_RESPONSE

    # ---------------------------------------------------------------
    # 3. Two images -> comparison
    # ---------------------------------------------------------------
    if intent == "comparison":
        if image2 is None:
            raise HTTPException(
                status_code=422,
                detail="image2 is required for image comparison.",
            )

        return COMPARISON_RESPONSE

    # ---------------------------------------------------------------
    # Unsupported query
    # ---------------------------------------------------------------
    raise HTTPException(
        status_code=400,
        detail=(
            "Unsupported presentation query. Try one of these: "
            "'What is in this image?', "
            "'Find the buildings.', or "
            "'What changed between these images?'"
        ),
    )