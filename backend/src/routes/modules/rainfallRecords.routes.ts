import { Router } from 'express';

import { RainfallRecordController } from '../../controllers/RainfallRecordController';

const rainfallRecordController = new RainfallRecordController();

export const rainfallRecordsRouter = Router({ mergeParams: true });

rainfallRecordsRouter.get('/', (req, res) => rainfallRecordController.list(req, res));
rainfallRecordsRouter.post('/', (req, res) => rainfallRecordController.create(req, res));
rainfallRecordsRouter.patch('/:id', (req, res) => rainfallRecordController.update(req, res));
rainfallRecordsRouter.delete('/:id', (req, res) => rainfallRecordController.delete(req, res));

