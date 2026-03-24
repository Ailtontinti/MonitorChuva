import { Router } from 'express';

import { authRouter } from './modules/auth.routes';
import { dashboardRouter } from './modules/dashboard.routes';
import { propertiesRouter } from './modules/properties.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/properties', propertiesRouter);

