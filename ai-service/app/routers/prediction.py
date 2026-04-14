from fastapi import APIRouter, HTTPException
from app.schemas import DelayPredictionRequest, DelayPredictionResponse, DemandForecastRequest, DemandForecastResponse
from app.services.prediction import predict_delay
from app.services.forecasting import forecast_demand

router = APIRouter(tags=['prediction'])


@router.post('/predict/delay', response_model=dict)
def predict_delay_endpoint(payload: DelayPredictionRequest) -> dict:
    return {
        'data': predict_delay(payload)
    }


@router.post('/forecast/demand', response_model=dict)
def forecast_demand_endpoint(payload: DemandForecastRequest) -> dict:
    try:
        return {
            'data': forecast_demand(payload)
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error