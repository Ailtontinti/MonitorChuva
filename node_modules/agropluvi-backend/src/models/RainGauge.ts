export type RainGaugeStatus = 'active' | 'inactive' | 'maintenance';

export interface RainGauge {
  id: string;
  propertyId: string;
  name: string;
  serialNumber: string | null;
  model: string | null;
  installationDate: Date | null;
  status: RainGaugeStatus;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

