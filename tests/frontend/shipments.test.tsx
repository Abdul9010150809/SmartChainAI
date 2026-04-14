import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShipmentsPage } from '../../frontend/src/pages/ShipmentsPage';

const submitShipmentMock = jest.fn();

jest.mock('../../frontend/src/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    dashboard: null,
    shipments: [
      {
        id: 'shipment-1',
        trackingNumber: 'SC-10001',
        origin: 'Mumbai, IN',
        destination: 'Berlin, DE',
        carrier: 'NorthStar Freight',
        status: 'in_transit',
        currentLocation: 'Dubai Hub',
        eta: '2026-04-16T12:00:00.000Z',
        delayRisk: 0.22,
        value: 42000,
        events: []
      },
      {
        id: 'shipment-2',
        trackingNumber: 'SC-10002',
        origin: 'Delhi, IN',
        destination: 'Hamburg, DE',
        carrier: 'ExpressLink',
        status: 'delayed',
        currentLocation: 'Jebel Ali',
        eta: '2026-04-17T12:00:00.000Z',
        delayRisk: 0.81,
        value: 18000,
        events: []
      }
    ],
    loading: false,
    error: null,
    selectedShipmentId: 'shipment-1',
    refreshDashboard: jest.fn(),
    submitShipment: submitShipmentMock,
    selectShipment: jest.fn(),
    authenticated: true,
    authLoading: false,
    authMode: 'manual',
    currentUser: {
      id: 'user-1',
      name: 'Ops User',
      email: 'ops@smartchainai.ai',
      role: 'operator'
    },
    login: jest.fn(),
    register: jest.fn(),
    useDemoSession: jest.fn(),
    logout: jest.fn()
  })
}));

describe('ShipmentsPage DOM flow', () => {
  beforeEach(() => {
    submitShipmentMock.mockReset();
  });

  it('renders route suggestions and analysis min/max cards', () => {
    const { container } = render(
      <MemoryRouter>
        <ShipmentsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Min value')).toBeInTheDocument();
    expect(screen.getByText('Max value')).toBeInTheDocument();

    const originSuggestions = container.querySelector('#origin-suggestions');
    const destinationSuggestions = container.querySelector('#destination-suggestions');

    expect(originSuggestions).not.toBeNull();
    expect(destinationSuggestions).not.toBeNull();
    expect(originSuggestions?.querySelectorAll('option').length).toBeGreaterThan(0);
    expect(destinationSuggestions?.querySelectorAll('option').length).toBeGreaterThan(0);
  });

  it('autofills shipment fields from pasted document text', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShipmentsPage />
      </MemoryRouter>
    );

    const documentArea = screen.getByPlaceholderText(/Paste a document or notes here/i);
    await user.type(
      documentArea,
      'Tracking: SC-90001\nOrigin: Delhi, IN\nDestination: Dubai, UAE\nCarrier: ExpressLink\nValue: 5000'
    );

    await user.click(screen.getByRole('button', { name: /Auto-fill from document/i }));

    await waitFor(() => {
      expect((screen.getByLabelText('Tracking Number') as HTMLInputElement).value).toBe('SC-90001');
      expect((screen.getByLabelText('Origin') as HTMLInputElement).value).toContain('Delhi');
      expect((screen.getByLabelText('Destination') as HTMLInputElement).value).toContain('Dubai');
      expect((screen.getByLabelText('Carrier') as HTMLInputElement).value).toBe('ExpressLink');
      expect((screen.getByLabelText('Declared Value') as HTMLInputElement).value).toBe('5000');
    });

    expect(screen.getByText(/Auto-filled:/i)).toBeInTheDocument();
  });

  it('supports voice-assist flow and fills fields from transcript', async () => {
    class MockSpeechRecognition {
      public lang = 'en-US';
      public interimResults = false;
      public continuous = false;
      public onstart: null | (() => void) = null;
      public onresult: null | ((event: any) => void) = null;
      public onerror: null | (() => void) = null;
      public onend: null | (() => void) = null;

      start() {
        this.onstart?.();
        this.onresult?.({
          results: [[{ transcript: 'Tracking SC-90100 origin Mumbai destination Hamburg carrier BlueRoute Cargo value 12000' }]]
        });
        this.onend?.();
      }
    }

    const browserWindow = window as unknown as {
      SpeechRecognition?: new () => MockSpeechRecognition;
    };
    browserWindow.SpeechRecognition = MockSpeechRecognition;

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShipmentsPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Voice input/i }));

    await waitFor(() => {
      expect((screen.getByLabelText('Tracking Number') as HTMLInputElement).value).toBe('SC-90100');
      expect((screen.getByLabelText('Carrier') as HTMLInputElement).value).toContain('BlueRoute Cargo');
      expect((screen.getByLabelText('Declared Value') as HTMLInputElement).value).toBe('12000');
      expect(screen.getByText(/Voice captured/i)).toBeInTheDocument();
    });
  });

  it('submits shipment form payload through dashboard context', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShipmentsPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Tracking Number'), 'SC-77777');
    await user.type(screen.getByLabelText('Origin'), 'Mumbai, IN');
    await user.type(screen.getByLabelText('Destination'), 'Hamburg, DE');
    await user.type(screen.getByLabelText('Carrier'), 'BlueRoute Cargo');
    const valueInput = screen.getByLabelText('Declared Value') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '22000' } });

    await user.click(screen.getByRole('button', { name: /Create shipment/i }));

    await waitFor(() => {
      expect(submitShipmentMock).toHaveBeenCalledWith(expect.objectContaining({
        trackingNumber: 'SC-77777',
        origin: 'Mumbai, IN',
        destination: 'Hamburg, DE',
        carrier: 'BlueRoute Cargo',
        value: 22000
      }));
    });
  });
});
