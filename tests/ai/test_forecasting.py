from pathlib import Path
import json
import sys

BASE_DIR = Path(__file__).resolve().parents[2] / 'ai-service'
sys.path.insert(0, str(BASE_DIR))

from app.schemas import DemandForecastRequest
from app.services.forecasting import forecast_demand


def test_forecast_trend_is_directional() -> None:
    payload = DemandForecastRequest(series=[5, 7, 9, 12, 16], horizon=3, smoothing_factor=0.5)
    result = forecast_demand(payload)

    assert result['trend'] == 'upward'
    assert [point['period'] for point in result['periods']] == ['Period 1', 'Period 2', 'Period 3']