from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

SpecialistModel = Literal["geochat", "grounding_dino", "changechat"]


class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float


class Detection(BaseModel):
    label: str
    confidence: float = Field(ge=0, le=1)
    box: BoundingBox


class ErrorDetail(BaseModel):
    code: str
    message: str


class QueryResponse(BaseModel):
    model: SpecialistModel
    route_rationale: str = ""
    answer: str | None = None
    detections: list[Detection] = Field(default_factory=list)
    result: dict[str, Any] | None = None
    warnings: list[str] = Field(default_factory=list)
