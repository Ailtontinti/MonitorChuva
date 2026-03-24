import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { UserRepository } from '../repositories/UserRepository';

export class UserController {
  constructor(private readonly userRepository = new UserRepository()) {}

  private async ensureAdminOrOwner(req: Request): Promise<void> {
    if (!req.userId || !req.tenant) {
      throw new Error('Usuário não autenticado.');
    }
    const current = await this.userRepository.findById(
      req.userId,
      req.tenant.organizationId,
    );
    if (!current || (current.role !== 'owner' && current.role !== 'admin')) {
      throw new Error('Acesso negado. Permissão insuficiente.');
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      const message = (error as Error).message;
      const status = message.startsWith('Acesso negado') ? 403 : 400;
      return res.status(status).json({ message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
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

      const passwordHash = await bcrypt.hash(password, 10);
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
    } catch (error) {
      const message = (error as Error).message;
      const status = message.startsWith('Acesso negado') ? 403 : 400;
      return res.status(status).json({ message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    if (!req.tenant) {
      return res
        .status(400)
        .json({ message: 'Organização (organization_id) não identificada na requisição.' });
    }

    const { id } = req.params;
    const { role, isActive } = req.body as { role?: string; isActive?: boolean };

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
    } catch (error) {
      const message = (error as Error).message;
      const status = message.startsWith('Acesso negado') ? 403 : 400;
      return res.status(status).json({ message });
    }
  }
}