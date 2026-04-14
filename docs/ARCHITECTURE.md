# Architecture Overview

SenseChainAI uses a three-service layout:

1. `frontend` handles user experience, dashboard visualizations, and API consumption.
2. `backend` owns business logic, authentication, persistence, validation, and orchestration.
3. `ai-service` isolates ML inference for delay prediction and demand forecasting.

## Data Flow

- Users interact with the frontend.
- The frontend calls the backend through Axios.
- The backend persists shipments and users in MongoDB.
- For prediction workflows, the backend calls the AI service over REST.

## Backend Design

- Controllers are thin and delegate to services.
- Services encapsulate business rules and external calls.
- Middleware handles auth, validation, logging, and error formatting.
- MongoDB models define schema validation and indexes.

## AI Design

- FastAPI provides typed request/response contracts.
- Prediction endpoints accept shipment and route features.
- Forecasting endpoints accept historical demand data and return period-based outputs.

## Testing Strategy

- Jest covers frontend and backend behavior.
- Python tests cover ML inference behavior and sample feature vectors.
- Integration tests validate API contracts and error handling.