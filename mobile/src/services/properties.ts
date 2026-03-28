import axios from 'axios';

import { API_BASE_URL } from '../config/api';
import { getToken } from './storage';

export interface Property {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
}

export interface CreatePropertyInput {
  name: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdatePropertyInput {
  name: string;
  latitude: number;
  longitude: number;
  metadata?: Record<string, unknown> | null;
}

export async function listProperties(organizationId: string): Promise<Property[]> {
  const token = await getToken();
  const { data } = await axios.get<Property[]>(`${API_BASE_URL}/api/properties`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': organizationId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return data;
}

export async function createProperty(
  organizationId: string,
  input: CreatePropertyInput,
): Promise<Property> {
  const token = await getToken();
  const { data } = await axios.post<Property>(
    `${API_BASE_URL}/api/properties`,
    {
      name: input.name,
      description: input.description ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      metadata: input.metadata ?? null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  return data;
}

export async function updateProperty(
  organizationId: string,
  id: string,
  input: UpdatePropertyInput,
): Promise<Property> {
  const token = await getToken();

  const { data } = await axios.put<Property>(
    `${API_BASE_URL}/api/properties/${id}`,
    {
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      metadata: input.metadata ?? null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  return data;
}

export async function deleteProperty(organizationId: string, id: string): Promise<void> {
  const token = await getToken();

  await axios.delete(`${API_BASE_URL}/api/properties/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': organizationId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

