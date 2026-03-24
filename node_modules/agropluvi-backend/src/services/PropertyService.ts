import { Property } from '../models/Property';
import {
  PropertyInsert,
  PropertyRepository,
  PropertyUpdate
} from '../repositories/PropertyRepository';

type GeoPoint = { lat: number; lng: number };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toGeoPointArray(value: unknown): GeoPoint[] | null {
  if (!Array.isArray(value)) return null;
  const points: GeoPoint[] = [];
  for (const item of value) {
    if (Array.isArray(item) && item.length >= 2 && isFiniteNumber(item[0]) && isFiniteNumber(item[1])) {
      points.push({ lat: item[1], lng: item[0] });
      continue;
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      if (isFiniteNumber(obj.lat) && isFiniteNumber(obj.lng)) {
        points.push({ lat: obj.lat, lng: obj.lng });
        continue;
      }
      if (isFiniteNumber(obj.latitude) && isFiniteNumber(obj.longitude)) {
        points.push({ lat: obj.latitude, lng: obj.longitude });
        continue;
      }
    }
    return null;
  }
  return points.length >= 3 ? points : null;
}

function closeRing(points: GeoPoint[]): GeoPoint[] {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first.lat === last.lat && first.lng === last.lng) return points;
  return [...points, first];
}

function normalizePropertyMetadata(metadata: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object') return metadata ?? null;

  const polygonFromGeoJson = (value: unknown): GeoPoint[] | null => {
    if (!value || typeof value !== 'object') return null;
    const geo = value as Record<string, unknown>;
    if (geo.type === 'Polygon' && Array.isArray(geo.coordinates) && geo.coordinates.length > 0) {
      return toGeoPointArray(geo.coordinates[0]);
    }
    return null;
  };

  const candidates: unknown[] = [
    metadata.boundaryPolygon,
    metadata.boundary,
    metadata.polygon,
    metadata.coordinates,
  ];

  for (const candidate of candidates) {
    const direct = toGeoPointArray(candidate);
    if (direct) {
      const ring = closeRing(direct);
      return {
        ...metadata,
        geoJson: { type: 'Polygon', coordinates: [ring.map((p) => [p.lng, p.lat])] },
      };
    }
    const geo = polygonFromGeoJson(candidate);
    if (geo) {
      const ring = closeRing(geo);
      return {
        ...metadata,
        geoJson: { type: 'Polygon', coordinates: [ring.map((p) => [p.lng, p.lat])] },
      };
    }
  }

  const geoJsonPolygon = polygonFromGeoJson(metadata.geoJson);
  if (geoJsonPolygon) {
    const ring = closeRing(geoJsonPolygon);
    return {
      ...metadata,
      geoJson: { type: 'Polygon', coordinates: [ring.map((p) => [p.lng, p.lat])] },
    };
  }

  return metadata;
}

export class PropertyService {
  constructor(private readonly propertyRepository = new PropertyRepository()) {}

  async list(organizationId: string): Promise<Property[]> {
    return this.propertyRepository.listByOrganization(organizationId);
  }

  async create(input: Omit<PropertyInsert, 'organizationId'> & { organizationId: string }): Promise<Property> {
    if (!input.name?.trim()) {
      throw new Error('Nome do talhão (propriedade) é obrigatório.');
    }

    return this.propertyRepository.create({
      organizationId: input.organizationId,
      name: input.name.trim(),
      description: input.description ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      metadata: normalizePropertyMetadata(input.metadata ?? null)
    });
  }

  async update(input: PropertyUpdate): Promise<Property> {
    const payload: PropertyUpdate = {
      ...input,
      ...('metadata' in input ? { metadata: normalizePropertyMetadata(input.metadata) } : {}),
    };
    const updated = await this.propertyRepository.update(payload);

    if (!updated) {
      throw new Error('Talhão não encontrado para esta organização.');
    }

    return updated;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const deleted = await this.propertyRepository.delete(id, organizationId);

    if (!deleted) {
      throw new Error('Talhão não encontrado para esta organização.');
    }
  }
}

