import { Router } from 'express';

import { RainGaugeController } from '../../controllers/RainGaugeController';
import { rainfallRecordsRouter } from './rainfallRecords.routes';

const rainGaugeController = new RainGaugeController();

export const rainGaugesRouter = Router({ mergeParams: true });

rainGaugesRouter.get('/', (req, res) => rainGaugeController.list(req, res));
rainGaugesRouter.post('/', (req, res) => rainGaugeController.create(req, res));
rainGaugesRouter.put('/:id', (req, res) => rainGaugeController.update(req, res));
rainGaugesRouter.delete('/:id', (req, res) => rainGaugeController.delete(req, res));

// Registros de chuva por pluviômetro
rainGaugesRouter.use('/:rainGaugeId/rainfall-records', rainfallRecordsRouter);

