export interface Zone {
  id: string;
  name: string;
  location: string;
  thumbnail?: string;
  geometry: any; // GeoJSON
  area: number;
  purpose: string;
  monitoringFrequency: string;
  satelliteSource: string;
  cloudThreshold: number;
  alertSensitivity: string;
  status: 'Active' | 'Stable' | 'Moderate' | 'High Risk';
  riskScore: number;
  createdAt: string;
  lastScanAt: string;
}

export interface Observation {
  date: string;
  image: string;
  cloudCoverage: number;
  resolution: string;
}

export interface ChangeData {
  detected: boolean;
  type: string;
  affectedArea: number;
  confidence: number;
  severity: 'Minor' | 'Moderate' | 'High' | 'Critical';
  riskScore: number;
  previousObservation: Observation;
  currentObservation: Observation;
}

export interface Alert {
  id: string;
  title: string;
  zoneId: string;
  zoneName: string;
  timeAgo: string;
  severity: 'Minor' | 'Moderate' | 'High' | 'Critical' | 'Success';
}

const mockZones: Zone[] = [
  {
    id: "yamuna-001",
    name: "Yamuna Flood Watch",
    location: "Delhi, India",
    thumbnail: "/yamuna.webp",
    geometry: {
      type: "Polygon",
      coordinates: [[[77.2, 28.6], [77.3, 28.6], [77.3, 28.7], [77.2, 28.7], [77.2, 28.6]]]
    },
    area: 42.6,
    purpose: "Flood Monitoring",
    monitoringFrequency: "Weekly",
    satelliteSource: "Sentinel-2",
    cloudThreshold: 20,
    alertSensitivity: "High",
    status: "High Risk",
    riskScore: 78,
    createdAt: "2026-08-10",
    lastScanAt: "2 hours ago"
  },
  {
    id: "aravalli-002",
    name: "Aravalli Forest",
    location: "Gurugram, India",
    thumbnail: "/aravalli.webp",
    geometry: {
      type: "Polygon",
      coordinates: [[[77.0, 28.4], [77.1, 28.4], [77.1, 28.5], [77.0, 28.5], [77.0, 28.4]]]
    },
    area: 128.4,
    purpose: "Deforestation Watch",
    monitoringFrequency: "Monthly",
    satelliteSource: "Landsat-9",
    cloudThreshold: 10,
    alertSensitivity: "Medium",
    status: "Stable",
    riskScore: 24,
    createdAt: "2026-01-15",
    lastScanAt: "1 day ago"
  },
  {
    id: "farmland-003",
    name: "Farmland Zone",
    location: "Sonipat, India",
    thumbnail: "/farmland.webp",
    geometry: {
      type: "Polygon",
      coordinates: [[[77.0, 28.9], [77.1, 28.9], [77.1, 29.0], [77.0, 29.0], [77.0, 28.9]]]
    },
    area: 85.2,
    purpose: "Crop Health Tracking",
    monitoringFrequency: "Bi-weekly",
    satelliteSource: "Sentinel-2",
    cloudThreshold: 15,
    alertSensitivity: "Low",
    status: "Moderate",
    riskScore: 45,
    createdAt: "2026-05-20",
    lastScanAt: "2 days ago"
  },
];

export const mockObservations: Record<string, Observation[]> = {
  'yamuna-001': [
    {
      date: '2026-08-01',
      image: 'https://images.unsplash.com/photo-1517789721473-cbcf6c54a32f?auto=format&fit=crop&q=80&w=400',
      cloudCoverage: 12,
      resolution: '10m',
    },
    {
      date: '2026-08-15',
      image: 'https://images.unsplash.com/photo-1517789721473-cbcf6c54a32f?auto=format&fit=crop&q=80&w=400',
      cloudCoverage: 18,
      resolution: '10m',
    },
    {
      date: '2026-08-25',
      image: 'https://images.unsplash.com/photo-1517789721473-cbcf6c54a32f?auto=format&fit=crop&q=80&w=400',
      cloudCoverage: 5,
      resolution: '10m',
    },
    {
      date: '2026-09-06',
      image: '/og.png',
      cloudCoverage: 2,
      resolution: '10m',
    },
  ],
  'aravalli-002': [
    {
      date: '2026-07-01',
      image: '/og.png',
      cloudCoverage: 5,
      resolution: '30m',
    },
    {
      date: '2026-08-01',
      image: '/og.png',
      cloudCoverage: 8,
      resolution: '30m',
    },
    {
      date: '2026-09-05',
      image: '/og.png',
      cloudCoverage: 1,
      resolution: '30m',
    },
  ],
  'farmland-003': [
    {
      date: '2026-08-10',
      image: '/og.png',
      cloudCoverage: 20,
      resolution: '10m',
    },
    {
      date: '2026-08-24',
      image: '/og.png',
      cloudCoverage: 15,
      resolution: '10m',
    },
    {
      date: '2026-09-04',
      image: '/og.png',
      cloudCoverage: 10,
      resolution: '10m',
    },
  ],
};

export const mockChanges: Record<string, ChangeData> = {
  'yamuna-001': {
    detected: true,
    type: 'Construction / Land Cover Change',
    affectedArea: 3.8,
    confidence: 92,
    severity: 'High',
    riskScore: 78,
    previousObservation: mockObservations['yamuna-001'][0],
    currentObservation: mockObservations['yamuna-001'][3],
  },
  'aravalli-002': {
    detected: false,
    type: 'None',
    affectedArea: 0,
    confidence: 99,
    severity: 'Minor',
    riskScore: 12,
    previousObservation: mockObservations['aravalli-002'][0],
    currentObservation: mockObservations['aravalli-002'][2],
  },
  'farmland-003': {
    detected: true,
    type: 'Crop Harvest',
    affectedArea: 12.5,
    confidence: 85,
    severity: 'Moderate',
    riskScore: 45,
    previousObservation: mockObservations['farmland-003'][0],
    currentObservation: mockObservations['farmland-003'][2],
  },
};

export const getZones = async (): Promise<Zone[]> => {
  return [...mockZones];
};

export const getZoneDetails = async (id: string): Promise<Zone | undefined> => {
  return mockZones.find((z) => z.id === id);
};

export const getObservations = async (
  zoneId: string,
): Promise<Observation[]> => {
  return mockObservations[zoneId] || [];
};

export const getChangeDetection = async (
  zoneId: string,
): Promise<ChangeData | null> => {
  return mockChanges[zoneId] || null;
};

export interface ZoneAnalytics {
  timelineData: { month: string; intensity: number }[];
  pieData: { name: string; value: number; color: string }[];
  recentChanges: { title: string; desc: string; type: 'rose' | 'emerald' | 'amber' | 'blue'; amount?: string }[];
  timelineEvents: { title: string; time: string; type: 'rose' | 'emerald' | 'amber' | 'blue' }[];
}

const mockAnalytics: Record<string, ZoneAnalytics> = {
  'yamuna-001': {
    timelineData: [
      { month: 'Jan', intensity: 30 }, { month: 'Feb', intensity: 35 }, { month: 'Mar', intensity: 25 },
      { month: 'Apr', intensity: 45 }, { month: 'May', intensity: 50 }, { month: 'Jun', intensity: 75 },
      { month: 'Jul', intensity: 90 }, { month: 'Aug', intensity: 95 }, { month: 'Sep', intensity: 85 },
    ],
    pieData: [
      { name: 'Water Spread', value: 65, color: '#3b82f6' },
      { name: 'Vegetation Loss', value: 20, color: '#10b981' },
      { name: 'Silt Deposition', value: 10, color: '#f59e0b' },
      { name: 'Infrastructure Risk', value: 5, color: '#ef4444' },
    ],
    recentChanges: [
      { type: 'rose', amount: '+12ha', title: 'Water Level Rise', desc: 'Detected on Sep 06, 2026. Significant expansion of river boundaries.' },
      { type: 'amber', amount: '-4ha', title: 'Bank Erosion', desc: 'Detected on Aug 20, 2026. Moderate soil loss along eastern banks.' }
    ],
    timelineEvents: [
      { type: 'rose', title: 'Flood Alert Triggered', time: 'Sep 06, 2026 • 10:45 AM' },
      { type: 'amber', title: 'Water Level Rising', time: 'Sep 04, 2026 • 09:00 AM' },
      { type: 'emerald', title: 'Routine Scan Complete', time: 'Sep 01, 2026 • 14:20 PM' }
    ]
  },
  'aravalli-002': {
    timelineData: [
      { month: 'Jan', intensity: 10 }, { month: 'Feb', intensity: 12 }, { month: 'Mar', intensity: 15 },
      { month: 'Apr', intensity: 20 }, { month: 'May', intensity: 35 }, { month: 'Jun', intensity: 40 },
      { month: 'Jul', intensity: 45 }, { month: 'Aug', intensity: 55 }, { month: 'Sep', intensity: 65 },
    ],
    pieData: [
      { name: 'Mining Activity', value: 45, color: '#f59e0b' },
      { name: 'Deforestation', value: 35, color: '#ef4444' },
      { name: 'Urban Sprawl', value: 15, color: '#8b5cf6' },
      { name: 'Other', value: 5, color: '#64748b' },
    ],
    recentChanges: [
      { type: 'rose', amount: '-18ha', title: 'Forest Cover Loss', desc: 'Detected on Sep 05, 2026. Matches illegal mining footprint patterns.' },
      { type: 'emerald', title: 'Reforestation Growth', desc: 'Detected on Jul 15, 2026. Minor canopy recovery in protected sector.' }
    ],
    timelineEvents: [
      { type: 'rose', title: 'Illegal Clearing Detected', time: 'Sep 05, 2026 • 11:30 AM' },
      { type: 'blue', title: 'Drone Verification Requested', time: 'Sep 05, 2026 • 13:00 PM' },
      { type: 'amber', title: 'Heat Anomaly', time: 'Aug 22, 2026 • 15:45 PM' }
    ]
  },
  'farmland-003': {
    timelineData: [
      { month: 'Jan', intensity: 40 }, { month: 'Feb', intensity: 80 }, { month: 'Mar', intensity: 90 },
      { month: 'Apr', intensity: 100 }, { month: 'May', intensity: 85 }, { month: 'Jun', intensity: 40 },
      { month: 'Jul', intensity: 30 }, { month: 'Aug', intensity: 60 }, { month: 'Sep', intensity: 75 },
    ],
    pieData: [
      { name: 'Healthy Crop', value: 70, color: '#10b981' },
      { name: 'Pest Stress', value: 15, color: '#ef4444' },
      { name: 'Water Stress', value: 10, color: '#f59e0b' },
      { name: 'Harvested', value: 5, color: '#eab308' },
    ],
    recentChanges: [
      { type: 'amber', amount: '15%', title: 'NDVI Drop', desc: 'Detected on Sep 04, 2026. Indicates potential water stress in northern quadrant.' },
      { type: 'emerald', amount: '+20%', title: 'Crop Maturation', desc: 'Detected on Aug 18, 2026. Consistent with expected seasonal growth cycle.' }
    ],
    timelineEvents: [
      { type: 'amber', title: 'Irrigation Alert', time: 'Sep 04, 2026 • 08:00 AM' },
      { type: 'emerald', title: 'Crop Health Optimal', time: 'Aug 18, 2026 • 10:15 AM' },
      { type: 'emerald', title: 'Planting Season Start', time: 'Jul 01, 2026 • 06:30 AM' }
    ]
  },
};

export const getZoneAnalytics = async (zoneId: string): Promise<ZoneAnalytics> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAnalytics[zoneId] || mockAnalytics['yamuna-001']);
    }, 400);
  });
};
