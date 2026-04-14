from functools import lru_cache
from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = 'SenseChainAI ML Service'
    api_prefix: str = ''
    cors_origins: list[str] = ['http://localhost:5173']


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    origins = os.getenv('AI_CORS_ORIGINS')
    if origins:
        parsed = [origin.strip() for origin in origins.split(',') if origin.strip()]
        return Settings(cors_origins=parsed or ['http://localhost:5173'])
    return Settings()