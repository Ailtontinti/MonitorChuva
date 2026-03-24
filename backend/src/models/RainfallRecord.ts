export interface RainfallRecord {
  id: string;
  rainGaugeId: string;
  recordedAt: Date;
  amountMm: number;
  source: string | null;
  createdAt: Date;
}

