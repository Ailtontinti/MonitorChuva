"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const AuthController_1 = require("./controllers/AuthController");
const WeatherController_1 = require("./controllers/WeatherController");
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const tenantResolver_1 = require("./middleware/tenantResolver");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const authController = new AuthController_1.AuthController();
const weatherController = new WeatherController_1.WeatherController();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Rotas públicas (sem X-Organization-Id)
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/weather/current', (req, res) => weatherController.current(req, res));
// Demais rotas exigem organização no header
app.use(tenantResolver_1.tenantResolver);
app.use('/api', routes_1.router);
app.use(errorHandler_1.errorHandler);
const port = env_1.env.PORT;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 AgroPluvi backend rodando em http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map