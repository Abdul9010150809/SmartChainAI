# Sample API Responses

## `POST /api/auth/demo`

```json
{
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "67e9baf7f0a1b3d2f9000001",
      "name": "Demo Operator",
        "email": "demo@smartchainai.ai",
      "role": "operator"
    }
  }
}
```

## `POST /api/auth/login`

```json
{
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "67e9baf7f0a1b3d2f9000002",
      "name": "Ava Operator",
      "email": "ava@sensechain.ai",
      "role": "operator"
    }
  }
}
```

## `GET /api/analytics/overview`

```json
{
  "data": {
    "activeShipments": 3,
    "deliveredShipments": 1,
    "delayedShipments": 1,
    "averageTransitHours": 28.4,
    "onTimeRate": 0.2
  }
}
```

## `GET /api/shipments`

```json
{
  "data": [
    {
      "trackingNumber": "SC-10001",
      "origin": "Mumbai, IN",
      "destination": "Berlin, DE",
      "carrier": "NorthStar Freight",
      "status": "in_transit",
      "currentLocation": "Dubai Hub",
      "eta": "2026-04-16T12:00:00.000Z",
      "delayRisk": 0.22,
      "value": 42000
    }
  ]
}
```
