from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request) -> dict[str, object]:
    registry = request.app.state.model_registry
    return {
        "status": "ok",
        "models_loaded": {
            "geochat": registry.geochat._loaded,
            "grounding_dino": registry.grounding_dino._loaded,
            "changechat": registry.changechat.available,
        },
    }
