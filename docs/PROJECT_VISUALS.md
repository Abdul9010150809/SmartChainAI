# SmartChainAI Visual Output Guide

This document provides visual-style output diagrams that explain how SmartChainAI works end-to-end.

## 1. System Architecture

```mermaid
flowchart LR
  U[User / Ops Team] --> FE[Frontend\nReact + Vite + Bootstrap]
  FE --> BE[Backend API\nExpress + TypeScript]
  BE --> DB[(MongoDB)]
  BE --> AI[AI Service\nFastAPI]
  BE --> MAPS[Location Service\nGeocoding / Maps]
  FE --> AUTH[Firebase Auth]
  AUTH --> FE
```

## 2. Shipment Intake UX Flow

```mermaid
flowchart TD
  A[Open Shipments Page] --> B[Choose Suggested Origin/Destination]
  B --> C[Paste Document Text]
  C --> D[Auto-fill Parser]
  D --> E[Optional Voice Input]
  E --> F[Validation + Min/Max Analysis]
  F --> G[Create Shipment]
  G --> H[Saved to Backend + MongoDB]
  H --> I[Visible in Dashboard + Alerts + Operations]
```

## 3. Role-Based Demo Connectivity

```mermaid
flowchart LR
  L[Login Page Demo Accounts] --> R1[Admin Demo]
  L --> R2[Operator Demo]
  L --> R3[Viewer Demo]

  R1 --> API1[/POST /api/auth/demo role=admin/]
  R2 --> API2[/POST /api/auth/demo role=operator/]
  R3 --> API3[/POST /api/auth/demo role=viewer/]

  API1 --> S[JWT Session]
  API2 --> S
  API3 --> S

  S --> UI[Role-Specific Dashboard Experience]
```

## 4. Analytics and Alerting Loop

```mermaid
flowchart TD
  S1[Shipments + Events] --> S2[Analytics Service]
  S2 --> S3[Delay Risk + Demand Forecast]
  S3 --> S4[Operations Insights]
  S4 --> S5[Alerts Page]
  S5 --> S6[Operator Action]
  S6 --> S1
```

## 5. What To Screenshot For Reporting

- Entry page with SmartChainAI hero and account status.
- Login page showing Admin/Operator/Viewer demo account cards.
- Shipments page with:
  - route suggestions
  - document auto-fill
  - voice input button
  - min/max analysis cards
- Operations page with backlog, top carriers, and high-risk shipments.
- Alerts page with severity-grouped recommendations.
- Settings page with role-aware session and preferences.
