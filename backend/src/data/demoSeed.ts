export const demoShipments = [
  {
    trackingNumber: 'SC-10001',
    origin: 'Mumbai, IN',
    destination: 'Delhi, IN',
    carrier: 'NorthStar Freight',
    status: 'in_transit',
    currentLocation: 'Nagpur Hub',
    etaOffsetHours: 36,
    delayRisk: 0.22,
    value: 42000,
    events: [
      {
        title: 'Departed origin',
        message: 'Shipment left the Mumbai fulfillment center.',
        offsetHours: 52
      },
      {
        title: 'Arrived at transit hub',
        message: 'Parcel cleared the Nagpur sorting hub.',
        offsetHours: 18
      }
    ]
  },
  {
    trackingNumber: 'SC-10002',
    origin: 'Pune, IN',
    destination: 'Bengaluru, IN',
    carrier: 'Apex Global Logistics',
    status: 'delivered',
    currentLocation: 'Bengaluru Distribution Center',
    etaOffsetHours: -12,
    delayRisk: 0.08,
    value: 18900,
    events: [
      {
        title: 'Out for delivery',
        message: 'Last-mile handoff completed in Bengaluru.',
        offsetHours: 6
      },
      {
        title: 'Delivered',
        message: 'Shipment delivered ahead of the updated ETA.',
        offsetHours: -1
      }
    ]
  },
  {
    trackingNumber: 'SC-10003',
    origin: 'Chennai, IN',
    destination: 'Hyderabad, IN',
    carrier: 'ExpressLink',
    status: 'delayed',
    currentLocation: 'Vijayawada Hub',
    etaOffsetHours: 24,
    delayRisk: 0.79,
    value: 65500,
    events: [
      {
        title: 'Weather hold',
        message: 'Road freight was delayed by monsoon traffic on the inland corridor.',
        offsetHours: 14
      },
      {
        title: 'Inspection queue',
        message: 'Terminal inspection increased dwell time at the hub.',
        offsetHours: 6
      }
    ]
  },
  {
    trackingNumber: 'SC-10004',
    origin: 'Hyderabad, IN',
    destination: 'Ahmedabad, IN',
    carrier: 'BlueRoute Cargo',
    status: 'pending',
    currentLocation: 'Warehouse Intake',
    etaOffsetHours: 72,
    delayRisk: 0.14,
    value: 27400,
    events: [
      {
        title: 'Awaiting dispatch',
        message: 'Shipment is staged for tomorrow’s departure window.',
        offsetHours: 2
      }
    ]
  },
  {
    trackingNumber: 'SC-10005',
    origin: 'Delhi, IN',
    destination: 'Kolkata, IN',
    carrier: 'NorthStar Freight',
    status: 'in_transit',
    currentLocation: 'Jaipur Crossdock',
    etaOffsetHours: 18,
    delayRisk: 0.31,
    value: 39800,
    events: [
      {
        title: 'Customs cleared',
        message: 'Internal transfer paperwork cleared for onward routing.',
        offsetHours: 30
      },
      {
        title: 'Lane transfer',
        message: 'Shipment was transferred to the eastern regional carrier network.',
        offsetHours: 10
      }
    ]
  }
];
