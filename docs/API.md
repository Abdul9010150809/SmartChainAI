# API Reference

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/demo`
- `GET /api/auth/me`

## Shipments

- `GET /api/shipments`
- `POST /api/shipments`
- `GET /api/shipments/:id`
- `PATCH /api/shipments/:id/status`
- `POST /api/shipments/:id/events`

## Analytics

- `GET /api/analytics/overview`
- `GET /api/analytics/delay-risk`
- `GET /api/analytics/demand-forecast`

## AI Service

- `GET /health`
- `POST /predict/delay`
- `POST /forecast/demand`

## Error Shape

```json
{
  "message": "Validation failed",
  "details": []
}
```