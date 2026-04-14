from statistics import mean
from app.schemas import DemandForecastRequest


def forecast_demand(payload: DemandForecastRequest) -> dict:
    series = payload.series
    if len(series) < 3:
        raise ValueError('At least three historical points are required')

    last_value = series[-1]
    previous_window = series[-min(7, len(series)) :]
    moving_average = mean(previous_window)
    slope = (series[-1] - series[0]) / max(len(series) - 1, 1)
    trend_adjustment = slope * payload.smoothing_factor
    baseline = (moving_average * (1 - payload.smoothing_factor)) + (last_value * payload.smoothing_factor)

    forecast_values: list[int] = []
    current = baseline
    for index in range(payload.horizon):
        seasonal_bias = 1 + (0.02 * ((index % 4) - 1))
        current = max(0, (current + trend_adjustment) * seasonal_bias)
        forecast_values.append(int(round(current)))

    trend = 'upward' if slope > 0.5 else 'downward' if slope < -0.5 else 'stable'
    confidence = round(max(0.35, min(0.95, 1 - (abs(slope) / max(moving_average, 1)))), 3)

    return {
        'periods': [
            {
                'period': f'Period {index + 1}',
                'expectedOrders': forecast_values[index]
            }
            for index in range(len(forecast_values))
        ],
        'trend': trend,
        'confidence': confidence,
    }