# SenseChainAI

SenseChainAI is a logistics intelligence platform for shipment tracking, delivery risk scoring, demand forecasting, and operations analytics.

## Architecture

- `frontend`: React + Vite + Tailwind dashboard for tracking and analytics
- `backend`: Express + MongoDB API with auth, validation, and orchestration logic
- `ai-service`: FastAPI service for delay prediction and demand forecasting
- `tests`: Frontend, backend, and AI test suites
- `docs`: API and system design documentation

## Features

- JWT-based authentication
- Shipment tracking and analytics dashboard
- Delay prediction and demand forecasting via REST
- MongoDB-backed persistence with validation and indexes
- Centralized logging and error handling

## Local Setup

1. Copy `.env.example` to `.env` and adjust values as needed.
2. Use Node `20.x` (`nvm use`) for frontend/backend commands.
3. Install dependencies for each service.
4. Add `GOOGLE_MAPS_API_KEY` in `.env` for location services.
5. Start MongoDB, backend, AI service, and frontend.

### Demo Launch

```bash
bash scripts/start-local.sh
```

### Google Maps Location Service

- The backend exposes `GET /api/location/geocode?address=<address>`.
- The backend exposes `GET /api/location/shipments/:id` for selected shipment map snapshots.
- The dashboard uses this service to display live Google Maps location cards for the selected shipment.

### Reset Demo Dataset

```bash
npm run seed:demo --workspace backend -- --reset
```

### Run with Docker

```bash
docker compose up --build
```

### Run locally

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

In a separate terminal for the AI service:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Documentation

- [API.md](docs/API.md)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)