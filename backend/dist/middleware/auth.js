"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }
    const [, token] = authHeader.split(' ');
    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação mal formatado.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.userId = decoded.sub;
        if (req.tenant && req.tenant.organizationId !== decoded.organizationId) {
            return res.status(403).json({
                message: 'organization_id do token não corresponde ao da requisição.'
            });
        }
        if (!req.tenant) {
            req.tenant = { organizationId: decoded.organizationId };
        }
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map