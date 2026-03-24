import axios from 'axios';

import { API_BASE_URL } from '../config/api';
import { getToken } from './storage';

export interface RainfallRecord {
  id: string;
  rainGaugeId: string;
  recordedAt: string;
  amountMm: number;
  source: string | null;
  createdAt: string;
}

export interface ListRainfallFilters {
  from?: string;
  to?: string;
}

export interface CreateRainfallRecordInput {
  recordedAt: string;
  amountMm: number;
  source?: string;
}

export interface UpdateRainfallRecordInput {
  recordedAt: string;
  amountMm: number;
  source?: string | null;
}

export async function listRainfallRecords(
  organizationId: string,
  propertyId: string,
  rainGaugeId: string,
  filters: ListRainfallFilters = {}
): Promise<RainfallRecord[]> {
  const params: Record<string, string> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  const token = await getToken();
  const { data } = await axios.get<RainfallRecord[]>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${rainGaugeId}/rainfall-records`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      params,
    }
  );

  return data;
}

export async function createRainfallRecord(
  organizationId: string,
  propertyId: string,
  rainGaugeId: string,
  input: CreateRainfallRecordInput
): Promise<RainfallRecord> {
  const token = await getToken();
  const { data } = await axios.post<RainfallRecord>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${rainGaugeId}/rainfall-records`,
    {
      recordedAt: input.recordedAt,
      amountMm: input.amountMm,
      source: input.source ?? 'manual',
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

export async function updateRainfallRecord(
  organizationId: string,
  propertyId: string,
  rainGaugeId: string,
  id: string,
  input: UpdateRainfallRecordInput
): Promise<RainfallRecord> {
  const token = await getToken();
  const { data } = await axios.patch<RainfallRecord>(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${rainGaugeId}/rainfall-records/${id}`,
    {
      recordedAt: input.recordedAt,
      amountMm: input.amountMm,
      source: input.source ?? null,
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

export async function deleteRainfallRecord(
  organizationId: string,
  propertyId: string,
  rainGaugeId: string,
  id: string
): Promise<void> {
  const token = await getToken();

  await axios.delete(
    `${API_BASE_URL}/api/properties/${propertyId}/rain-gauges/${rainGaugeId}/rainfall-records/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
}

