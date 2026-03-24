"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserRepository_1 = require("../repositories/UserRepository");
class UserController {
    constructor(userRepository = new UserRepository_1.UserRepository()) {
        this.userRepository = userRepository;
    }
    async ensureAdminOrOwner(req) {
        if (!req.userId || !req.tenant) {
            throw new Error('Usuário não autenticado.');
        }
        const current = await this.userRepository.findById(req.userId, req.tenant.organizationId);
        if (!current || (current.role !== 'owner' && current.role !== 'admin')) {
            throw new Error('Acesso negado. Permissão insuficiente.');
        }
    }
    async list(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        try {
            await this.ensureAdminOrOwner(req);
            const users = await this.userRepository.listByOrganization(req.tenant.organizationId);
            const safeUsers = users.map((u) => ({
                id: u.id,
                organizationId: u.organizationId,
                name: u.name,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt,
            }));
            return res.status(200).json(safeUsers);
        }
        catch (error) {
            const message = error.message;
            const status = message.startsWith('Acesso negado') ? 403 : 400;
            return res.status(status).json({ message });
        }
    }
    async create(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { name, email, password, role } = req.body;
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'Informe nome, e-mail e senha.' });
        }
        try {
            await this.ensureAdminOrOwner(req);
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const user = await this.userRepository.create({
                organizationId: req.tenant.organizationId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                passwordHash,
                role,
            });
            return res.status(201).json({
                id: user.id,
                organizationId: user.organizationId,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            });
        }
        catch (error) {
            const message = error.message;
            const status = message.startsWith('Acesso negado') ? 403 : 400;
            return res.status(status).json({ message });
        }
    }
    async update(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { id } = req.params;
        const { role, isActive } = req.body;
        try {
            await this.ensureAdminOrOwner(req);
            const user = await this.userRepository.updateById(id, req.tenant.organizationId, {
                role,
                isActive,
            });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            return res.status(200).json({
                id: user.id,
                organizationId: user.organizationId,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            });
        }
        catch (error) {
            const message = error.message;
            const status = message.startsWith('Acesso negado') ? 403 : 400;
            return res.status(status).json({ message });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map