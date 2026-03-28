import axios from 'axios';

import { API_BASE_URL } from '../config/api';
import { getToken } from './storage';

export type RainGaugeStatus = 'active' | 'inactive' | 'maintenance';

export interface RainGauge {
  id: string;
  propertyId: string;
  name: string;
  serialNumber: string | null;
  model: string | null;
  installationDate: string | null;
  status: RainGaugeStatus;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRainGaugeInput {
  name: string;
  serialNumber?: string;
  model?: string;
  installationDate?: string;
  status?: RainGaugeStatus;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateRainGaugeInput {
  name?: string;
  serialNumber?: string | null;
  model?: string | null;
  installationDate?: string | null;
  status?: RainGaugeStatus;
  latitude?: number | null;
  longitude?: number | null;
}

export async function listRainGauges(
  organizationId: string,
  propertyId: string
): Promise<RainGauge[]> {
  const token = await getToken();
  const { data } = await axios.get<RainGauge[]>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return data;
}

export async function createRainGauge(
  organizationId: string,
  propertyId: string,
  input: CreateRainGaugeInput
): Promise<RainGauge> {
  const token = await getToken();
  const { data } = await axios.post<RainGauge>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges`,
    {
      name: input.name.trim(),
      serialNumber: input.serialNumber?.trim() ?? null,
      model: input.model?.trim() ?? null,
      installationDate: input.installationDate ?? null,
      status: input.status ?? 'active',
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return data;
}

export async function updateRainGauge(
  organizationId: string,
  propertyId: string,
  id: string,
  input: UpdateRainGaugeInput
): Promise<RainGauge> {
  const token = await getToken();
  const { data } = await axios.put<RainGauge>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${id}`,
    {
      name: input.name?.trim(),
      serialNumber: input.serialNumber ?? null,
      model: input.model ?? null,
      installationDate: input.installationDate ?? null,
      status: input.status,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return data;
}

export async function deleteRainGauge(
  organizationId: string,
  propertyId: string,
  id: string
): Promise<void> {
  const token = await getToken();
  await axios.delete(`${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': organizationId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
