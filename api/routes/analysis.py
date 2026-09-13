from __future__ import annotations

from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from api.dependencies import get_registry
from api.schemas.common import ErrorDetail, QueryResponse
from src.llm.router import GeminiRouter, InvalidRouteError, RouterUnavailableError
from src.models.change.inference import ChangeModelUnavailableError
from src.models.geochat.inference import GeoChatUnavailableError
from src.models.grounding.inference import GroundingDinoUnavailableError
from src.models.registry import ModelRegistry
from src.pipelines.analysis import run_specialist

router = APIRouter(tags=["analysis"])


async def _read_image(upload: UploadFile) -> Image.Image:
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail=ErrorDetail(code="invalid_image", message="Uploads must be images.").model_dump())
    try:
        content = await upload.read()
        image = Image.open(BytesIO(content))
        image.load()
        return image.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=422, detail=ErrorDetail(code="invalid_image", message="Unable to decode uploaded image.").model_dump()) from exc


@router.post("/query", response_model=QueryResponse)
async def query(
    query: str = Form(..., min_length=1, max_length=8_000),
    image1: UploadFile = File(...),
    image2: UploadFile | None = File(None),
    registry: ModelRegistry = Depends(get_registry),
) -> QueryResponse:
    first = await _read_image(image1)
    second = await _read_image(image2) if image2 else None
    router_service = GeminiRouter(registry.settings)
    try:
        decision = router_service.route(query, 2 if second else 1)
        return run_specialist(registry, decision, query, first, second)
    except (RouterUnavailableError, InvalidRouteError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ErrorDetail(code="router_unavailable", message=str(exc)).model_dump()) from exc
    except (GeoChatUnavailableError, GroundingDinoUnavailableError, ChangeModelUnavailableError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ErrorDetail(code="model_unavailable", message=str(exc)).model_dump()) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=ErrorDetail(code="invalid_request", message=str(exc)).model_dump()) from exc
