from fastapi import FastAPI

from api.routes.demo import router as demo_router


def create_app() -> FastAPI:
    app = FastAPI(title="SatQuery AI", version="0.1.0")
    app.include_router(demo_router)
    return app


app = create_app()
