from pathlib import Path
import json
import sys

BASE_DIR = Path(__file__).resolve().parents[2] / 'ai-service'
sys.path.insert(0, str(BASE_DIR))

from app.schemas import DelayPredictionRequest, DemandForecastRequest
from app.services.prediction import predict_delay
from app.services.forecasting import forecast_demand


def load_sample_inputs() -> dict:
    return json.loads(Path(__file__).with_name('fixtures').joinpath('sample_inputs.json').read_text())


def test_delay_prediction_returns_probability_and_risk_level() -> None:
    sample = load_sample_inputs()['delay_prediction']
    result = predict_delay(DelayPredictionRequest(**sample))

    assert 0 <= result['probability'] <= 1
    assert result['risk_level'] in {'low', 'medium', 'high'}
    assert result['expected_delay_hours'] >= 0


def test_demand_forecast_returns_requested_horizon() -> None:
    sample = load_sample_inputs()['demand_forecast']
    result = forecast_demand(DemandForecastRequest(**sample))

    assert len(result['periods']) == 4
    assert all('expectedOrders' in point for point in result['periods'])
    assert result['confidence'] <= 0.95