import { Request, Response } from 'express';

import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  async login(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      return res.status(401).json({ message: (error as Error).message });
    }
  }

  async register(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
}

