import { PropertyRepository } from '../repositories/PropertyRepository';
import {
  RainGaugeInsert,
  RainGaugeRepository,
  RainGaugeUpdate
} from '../repositories/RainGaugeRepository';
import { RainGauge } from '../models/RainGauge';

export class RainGaugeService {
  constructor(
    private readonly rainGaugeRepository = new RainGaugeRepository(),
    private readonly propertyRepository = new PropertyRepository()
  ) {}

  async listByProperty(propertyId: string, organizationId: string): Promise<RainGauge[]> {
    const property = await this.propertyRepository.findById(propertyId, organizationId);
    if (!property) {
      throw new Error('Talhão não encontrado para esta organização.');
    }

    return this.rainGaugeRepository.listByProperty(propertyId);
  }

  async create(
    input: Omit<RainGaugeInsert, 'propertyId'> & { propertyId: string; organizationId: string }
  ): Promise<RainGauge> {
    const property = await this.propertyRepository.findById(input.propertyId, input.organizationId);
    if (!property) {
      throw new Error('Talhão não encontrado para esta organização.');
    }

    if (!input.name?.trim()) {
      throw new Error('Nome do pluviômetro é obrigatório.');
    }

    return this.rainGaugeRepository.create({
      propertyId: input.propertyId,
      name: input.name.trim(),
      serialNumber: input.serialNumber ?? null,
      model: input.model ?? null,
      installationDate: input.installationDate ?? null,
      status: input.status ?? 'active',
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null
    });
  }

  async update(input: RainGaugeUpdate & { organizationId: string }): Promise<RainGauge> {
    const property = await this.propertyRepository.findById(input.propertyId, input.organizationId);
    if (!property) {
      throw new Error('Talhão não encontrado para esta organização.');
    }

    const updated = await this.rainGaugeRepository.update(input);
    if (!updated) {
      throw new Error('Pluviômetro não encontrado para este talhão.');
    }

    return updated;
  }

  async delete(id: string, propertyId: string, organizationId: string): Promise<void> {
    const property = await this.propertyRepository.findById(propertyId, organizationId);
    if (!property) {
      throw new Error('Talhão não encontrado para esta organização.');
    }

    const deleted = await this.rainGaugeRepository.delete(id, propertyId);
    if (!deleted) {
      throw new Error('Pluviômetro não encontrado para este talhão.');
    }
  }
}

