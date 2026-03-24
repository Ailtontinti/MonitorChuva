import { Router } from 'express';
import { WeatherController } from '../../controllers/WeatherController';

const controller = new WeatherController();
export const weatherRouter = Router();

weatherRouter.get('/current', (req, res) => controller.current(req, res));
