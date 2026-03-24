import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { User } from '../models/User';
import { OrganizationRepository } from '../repositories/OrganizationRepository';
import { UserRepository } from '../repositories/UserRepository';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'organizationId' | 'role'>;
}

const jwtSignOptions = (expiresIn: string): SignOptions => ({
  expiresIn: expiresIn as SignOptions['expiresIn']
});

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly organizationRepository = new OrganizationRepository()
  ) {}

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        organizationId: user.organizationId
      },
      env.JWT_SECRET,
      jwtSignOptions(env.JWT_EXPIRES_IN)
    );

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

  async register({ organizationName, name, email, password }: RegisterInput): Promise<AuthResponse> {
    const org = await this.organizationRepository.create({
      name: organizationName.trim(),
      slug: organizationName.trim().toLowerCase().replace(/\s+/g, '-') || undefined
    });

    const existing = await this.userRepository.findByEmailAndOrganization(email, org.id);
    if (existing) {
      throw new Error('Já existe um usuário com este e-mail nesta organização.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      organizationId: org.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'owner'
    });

    const token = jwt.sign(
      { sub: user.id, organizationId: user.organizationId },
      env.JWT_SECRET,
      jwtSignOptions(env.JWT_EXPIRES_IN)
    );

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

