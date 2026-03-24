export interface Property {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

