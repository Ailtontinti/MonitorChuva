import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { UserController } from '../../controllers/UserController';

const controller = new UserController();
export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/', (req, res) => controller.list(req, res));
usersRouter.post('/', (req, res) => controller.create(req, res));
usersRouter.patch('/:id', (req, res) => controller.update(req, res));