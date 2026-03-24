"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    constructor(authService = new AuthService_1.AuthService()) {
        this.authService = authService;
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email?.trim() || !password) {
                return res.status(400).json({ message: 'Informe e-mail e senha.' });
            }
            const result = await this.authService.login({
                email: email.trim(),
                password
            });
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(401).json({ message: error.message });
        }
    }
    async register(req, res) {
        try {
            const { organizationName, name, email, password } = req.body;
            if (!organizationName?.trim() || !name?.trim() || !email?.trim() || !password) {
                return res.status(400).json({ message: 'Preencha nome da organização, nome, e-mail e senha.' });
            }
            const result = await this.authService.register({
                organizationName: organizationName.trim(),
                name: name.trim(),
                email: email.trim(),
                password
            });
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map