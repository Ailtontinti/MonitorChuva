import { RainGaugeRepository } from '../repositories/RainGaugeRepository';
import {
  RainfallRecordInsert,
  RainfallRecordRepository
} from '../repositories/RainfallRecordRepository';
import { RainfallRecord } from '../models/RainfallRecord';
import { PropertyRepository } from '../repositories/PropertyRepository';

export class RainfallRecordService {
  constructor(
    private readonly rainfallRecordRepository = new RainfallRecordRepository(),
    private readonly rainGaugeRepository = new RainGaugeRepository(),
    private readonly propertyRepository = new PropertyRepository()
  ) {}

  private async ensureGaugeBelongsToOrganization(
    rainGaugeId: string,
    organizationId: string
  ): Promise<{ propertyId: string }> {
    // Primeiro buscamos o pluviômetro e o talhão via join, garantindo que
    // o pluviômetro pertence a um talhão da organização informada.
    const result = await this.rainGaugeRepository.findWithProperty(rainGaugeId, organizationId);

    if (!result) {
      throw new Error('Pluviômetro não encontrado para esta organização.');
    }

    return { propertyId: result.propertyId };
  }

  async listByRainGauge(
    rainGaugeId: string,
    organizationId: string,
    from?: Date,
    to?: Date
  ): Promise<RainfallRecord[]> {
    await this.ensureGaugeBelongsToOrganization(rainGaugeId, organizationId);
    return this.rainfallRecordRepository.listByRainGauge(rainGaugeId, from, to);
  }

  async create(
    input: Omit<RainfallRecordInsert, 'rainGaugeId' | 'recordedAt'> & {
      rainGaugeId: string;
      organizationId: string;
      recordedAt: Date;
    }
  ): Promise<RainfallRecord> {
    if (!Number.isFinite(input.amountMm) || input.amountMm < 0) {
      throw new Error('Valor de chuva (mm) deve ser um número maior ou igual a zero.');
    }

    await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);

    return this.rainfallRecordRepository.create({
      rainGaugeId: input.rainGaugeId,
      recordedAt: input.recordedAt,
      amountMm: input.amountMm,
      source: input.source ?? null
    });
  }

  async update(
    input: {
      rainGaugeId: string;
      organizationId: string;
      id: string;
      input: {
        recordedAt: Date;
        amountMm: number;
        source?: string | null;
      };
    },
  ): Promise<RainfallRecord> {
    if (!Number.isFinite(input.input.amountMm) || input.input.amountMm < 0) {
      throw new Error('Valor de chuva (mm) deve ser um número maior ou igual a zero.');
    }

    await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);

    const updated = await this.rainfallRecordRepository.update({
      id: input.id,
      rainGaugeId: input.rainGaugeId,
      recordedAt: input.input.recordedAt,
      amountMm: input.input.amountMm,
      source: input.input.source ?? null,
    });

    if (!updated) {
      throw new Error('Registro de chuva não encontrado.');
    }

    return updated;
  }

  async delete(input: {
    rainGaugeId: string;
    organizationId: string;
    id: string;
  }): Promise<void> {
    await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);

    const deleted = await this.rainfallRecordRepository.delete({
      id: input.id,
      rainGaugeId: input.rainGaugeId,
    });

    if (!deleted) {
      throw new Error('Registro de chuva não encontrado.');
    }
  }
}

