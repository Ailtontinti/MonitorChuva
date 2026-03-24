import { Router } from 'express';
import { DashboardController } from '../../controllers/DashboardController';

const controller = new DashboardController();
export const dashboardRouter = Router();

dashboardRouter.get('/rain-summary', (req, res) => controller.rainSummary(req, res));
dashboardRouter.get('/rain-gauges-map', (req, res) => controller.rainGaugesMap(req, res));
