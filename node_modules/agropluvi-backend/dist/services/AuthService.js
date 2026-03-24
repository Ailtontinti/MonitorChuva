"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const OrganizationRepository_1 = require("../repositories/OrganizationRepository");
const UserRepository_1 = require("../repositories/UserRepository");
class AuthService {
    constructor(userRepository = new UserRepository_1.UserRepository(), organizationRepository = new OrganizationRepository_1.OrganizationRepository()) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }
    async login({ email, password }) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.isActive) {
            throw new Error('Credenciais inválidas.');
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            throw new Error('Credenciais inválidas.');
        }
        const token = jsonwebtoken_1.default.sign({
            organizationId: user.organizationId
        }, env_1.env.JWT_SECRET, {
            subject: user.id,
            expiresIn: env_1.env.JWT_EXPIRES_IN
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                organizationId: user.organizationId,
                role: user.role
            }
        };
    }
    async register({ organizationName, name, email, password }) {
        const org = await this.organizationRepository.create({
            name: organizationName.trim(),
            slug: organizationName.trim().toLowerCase().replace(/\s+/g, '-') || undefined
        });
        const existing = await this.userRepository.findByEmailAndOrganization(email, org.id);
        if (existing) {
            throw new Error('Já existe um usuário com este e-mail nesta organização.');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await this.userRepository.create({
            organizationId: org.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash,
            role: 'owner'
        });
        const token = jsonwebtoken_1.default.sign({ organizationId: user.organizationId }, env_1.env.JWT_SECRET, { subject: user.id, expiresIn: env_1.env.JWT_EXPIRES_IN });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                organizationId: user.organizationId,
                role: user.role
            }
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map