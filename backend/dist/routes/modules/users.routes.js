"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const UserController_1 = require("../../controllers/UserController");
const controller = new UserController_1.UserController();
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.use(auth_1.authMiddleware);
exports.usersRouter.get('/', (req, res) => controller.list(req, res));
exports.usersRouter.post('/', (req, res) => controller.create(req, res));
exports.usersRouter.patch('/:id', (req, res) => controller.update(req, res));
//# sourceMappingURL=users.routes.js.map