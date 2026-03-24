import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface JwtPayload {
  sub: string; // userId
  organizationId: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação mal formatado.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

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
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

