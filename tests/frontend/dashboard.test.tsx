import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from '../../frontend/src/pages/DashboardPage';

jest.mock('../../frontend/src/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    dashboard: {
      overview: {
        activeShipments: 18,
        deliveredShipments: 41,
        delayedShipments: 3,
        averageTransitHours: 28.4,
        onTimeRate: 0.92
      },
      shipments: [
        {
          id: 'shipment-1',
          trackingNumber: 'SC-10001',
          origin: 'Mumbai',
          destination: 'Berlin',
          carrier: 'NorthStar Freight',
          status: 'in_transit',
          currentLocation: 'Dubai Hub',
          eta: '2026-04-16T12:00:00.000Z',
          delayRisk: 0.22,
          value: 42000,
          events: [
            {
              id: 'event-1',
              title: 'Departed origin',
              message: 'Shipment left the Mumbai warehouse',
              occurredAt: '2026-04-13T08:00:00.000Z'
            }
          ]
        }
      ],
      delayRisk: [
        { label: 'SC-10001', probability: 0.22, reason: 'Stable transit conditions' }
      ],
      demandForecast: [
        { period: 'Period 1', expectedOrders: 18 },
        { period: 'Period 2', expectedOrders: 21 }
      ]
    },
    shipments: [
      {
        id: 'shipment-1',
        trackingNumber: 'SC-10001',
        origin: 'Mumbai',
        destination: 'Berlin',
        carrier: 'NorthStar Freight',
        status: 'in_transit',
        currentLocation: 'Dubai Hub',
        eta: '2026-04-16T12:00:00.000Z',
        delayRisk: 0.22,
        value: 42000,
        events: [
          {
            id: 'event-1',
            title: 'Departed origin',
            message: 'Shipment left the Mumbai warehouse',
            occurredAt: '2026-04-13T08:00:00.000Z'
          }
        ]
      }
    ],
    loading: false,
    error: null,
    selectedShipmentId: 'shipment-1',
    refreshDashboard: jest.fn(),
    submitShipment: jest.fn(),
    selectShipment: jest.fn()
  })
}));

describe('DashboardPage', () => {
  it('renders the operations dashboard', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Operations Command Center')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SC-10001' })).toBeInTheDocument();
    expect(screen.getByText('Active Shipments')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });
});