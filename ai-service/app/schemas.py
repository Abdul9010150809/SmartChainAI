from pydantic import BaseModel, Field


class DelayPredictionRequest(BaseModel):
    distance_km: float = Field(ge=0)
    weather_severity: float = Field(ge=0, le=1)
    carrier_reliability: float = Field(ge=0, le=1)
    dwell_hours: float = Field(ge=0)
    load_factor: float = Field(ge=0, le=1)
    customs_delay_hours: float = Field(default=0, ge=0)
    vehicle_age_years: float = Field(default=0, ge=0)


class DelayPredictionResponse(BaseModel):
    probability: float
    expected_delay_hours: float
    risk_level: str
    reason: str


class DemandForecastRequest(BaseModel):
    series: list[float] = Field(min_length=3)
    horizon: int = Field(default=5, ge=1, le=30)
    smoothing_factor: float = Field(default=0.45, ge=0.05, le=0.95)


class ForecastPoint(BaseModel):
    period: str
    expectedOrders: int


class DemandForecastResponse(BaseModel):
    periods: list[ForecastPoint]
    trend: str
    confidence: float