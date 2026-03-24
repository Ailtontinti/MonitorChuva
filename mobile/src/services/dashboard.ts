import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface RainSummaryPoint {
  date: string;
  totalMm: number;
}

export async function getRainSummary(
  organizationId: string,
  days = 7
): Promise<RainSummaryPoint[]> {
  const { data } = await axios.get<RainSummaryPoint[]>(
    `${API_BASE_URL}/api/dashboard/rain-summary`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
      },
      params: { days },
    }
  );
  return data;
}

export interface RainGaugeMapItem {
  id: string;
  propertyId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export async function getRainGaugesForMap(
  organizationId: string
): Promise<RainGaugeMapItem[]> {
  const { data } = await axios.get<RainGaugeMapItem[]>(
    `${API_BASE_URL}/api/dashboard/rain-gauges-map`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
      },
    }
  );
  return data;
}
