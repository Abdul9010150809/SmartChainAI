from math import exp
from app.schemas import DelayPredictionRequest


def _sigmoid(value: float) -> float:
    return 1 / (1 + exp(-value))


def predict_delay(payload: DelayPredictionRequest) -> dict:
    normalized_distance = min(payload.distance_km / 1500, 1.0)
    reliability_gap = 1 - payload.carrier_reliability
    congestion_factor = min(payload.dwell_hours / 24, 1.0)
    operational_load = payload.load_factor
    customs_penalty = min(payload.customs_delay_hours / 12, 1.0)
    maintenance_penalty = min(payload.vehicle_age_years / 12, 1.0)

    score = (
        1.4 * payload.weather_severity
        + 1.1 * normalized_distance
        + 1.3 * reliability_gap
        + 0.9 * congestion_factor
        + 1.0 * operational_load
        + 0.7 * customs_penalty
        + 0.4 * maintenance_penalty
        - 1.35
    )

    probability = round(_sigmoid(score), 3)
    expected_delay_hours = round(
        (payload.dwell_hours * 0.35)
        + (payload.weather_severity * 6)
        + (normalized_distance * 3)
        + (reliability_gap * 4)
        + payload.customs_delay_hours * 0.5,
        2,
    )

    if probability >= 0.75:
        risk_level = 'high'
        reason = 'Severe weather and low carrier reliability are increasing delivery risk.'
    elif probability >= 0.45:
        risk_level = 'medium'
        reason = 'Operational conditions suggest moderate delay exposure.'
    else:
        risk_level = 'low'
        reason = 'The shipment is currently on a stable delivery path.'

    return {
        'probability': probability,
        'expected_delay_hours': expected_delay_hours,
        'risk_level': risk_level,
        'reason': reason,
    }