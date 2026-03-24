import { Router } from 'express';

import { PropertyController } from '../../controllers/PropertyController';
import { authMiddleware } from '../../middleware/auth';
import { rainGaugesRouter } from './rainGauges.routes';

const propertyController = new PropertyController();

export const propertiesRouter = Router();

propertiesRouter.use(authMiddleware);

propertiesRouter.get('/', (req, res) => propertyController.list(req, res));
propertiesRouter.post('/', (req, res) => propertyController.create(req, res));
propertiesRouter.put('/:id', (req, res) => propertyController.update(req, res));
propertiesRouter.delete('/:id', (req, res) => propertyController.delete(req, res));

// Pluviômetros por talhão
propertiesRouter.use('/:propertyId/rain-gauges', rainGaugesRouter);

