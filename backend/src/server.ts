import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { AuthController } from './controllers/AuthController';
import { WeatherController } from './controllers/WeatherController';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { tenantResolver } from './middleware/tenantResolver';
import { router } from './routes';

const app: Application = express();
const authController = new AuthController();
const weatherController = new WeatherController();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Rotas públicas (sem X-Organization-Id)
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/weather/current', (req, res) => weatherController.current(req, res));

// Demais rotas exigem organização no header
app.use(tenantResolver);

app.use('/api', router);

app.use(errorHandler);

const port = env.PORT;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 AgroPluvi backend rodando em http://localhost:${port}`);
});

