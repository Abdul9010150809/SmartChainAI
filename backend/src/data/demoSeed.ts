export const demoShipments = [
  {
    trackingNumber: 'SC-10001',
    origin: 'Mumbai, IN',
    destination: 'Berlin, DE',
    carrier: 'NorthStar Freight',
    status: 'in_transit',
    currentLocation: 'Dubai Hub',
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
        message: 'Parcel cleared the Dubai sorting hub.',
        offsetHours: 18
      }
    ]
  },
  {
    trackingNumber: 'SC-10002',
    origin: 'Pune, IN',
    destination: 'London, UK',
    carrier: 'Apex Global Logistics',
    status: 'delivered',
    currentLocation: 'Heathrow Distribution Center',
    etaOffsetHours: -12,
    delayRisk: 0.08,
    value: 18900,
    events: [
      {
        title: 'Out for delivery',
        message: 'Last-mile handoff completed in London.',
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
    destination: 'Dubai, AE',
    carrier: 'ExpressLink',
    status: 'delayed',
    currentLocation: 'Jebel Ali Port',
    etaOffsetHours: 24,
    delayRisk: 0.79,
    value: 65500,
    events: [
      {
        title: 'Weather hold',
        message: 'Sea freight was delayed by storm activity in the Gulf.',
        offsetHours: 14
      },
      {
        title: 'Inspection queue',
        message: 'Customs inspection increased dwell time at the port.',
        offsetHours: 6
      }
    ]
  },
  {
    trackingNumber: 'SC-10004',
    origin: 'Hyderabad, IN',
    destination: 'Singapore, SG',
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
    destination: 'Paris, FR',
    carrier: 'NorthStar Freight',
    status: 'in_transit',
    currentLocation: 'Istanbul Sorting Hub',
    etaOffsetHours: 18,
    delayRisk: 0.31,
    value: 39800,
    events: [
      {
        title: 'Customs cleared',
        message: 'Export paperwork cleared for onward routing.',
        offsetHours: 30
      },
      {
        title: 'Lane transfer',
        message: 'Shipment was transferred to the European carrier network.',
        offsetHours: 10
      }
    ]
  }
];
