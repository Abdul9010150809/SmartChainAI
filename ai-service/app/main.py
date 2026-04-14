from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.routers.health import router as health_router
from app.routers.prediction import router as prediction_router

settings = get_settings()
logger = configure_logging()

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health_router)
app.include_router(prediction_router)


@app.on_event('startup')
def on_startup() -> None:
    logger.info('AI service booted successfully')