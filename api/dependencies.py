from fastapi import Request

from src.models.registry import ModelRegistry


async def get_registry(request: Request) -> ModelRegistry:
    return request.app.state.model_registry
