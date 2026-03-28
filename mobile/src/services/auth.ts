import axios, { isAxiosError } from 'axios';

import { API_BASE_URL } from '../config/api';

/** Primeira chamada ao Render (cold start) pode levar 30–60s no plano gratuito. */
const AUTH_REQUEST_TIMEOUT_MS = 60000;

export function getAuthApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string') return data.message;
    if (err.code === 'ECONNABORTED') {
      return 'O servidor demorou demais para responder. Toque de novo em Entrar (às vezes o servidor está “acordando”).';
    }
    if (!err.response) {
      return 'Sem resposta do servidor. Confira a internet ou se a API está no ar.';
    }
  }
  return fallback;
}

export interface LoginParams {
  email: string;
  password: string;
}

export type UserRole = 'owner' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role?: UserRole;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface RegisterParams {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

export async function register(params: RegisterParams): Promise<LoginResult> {
  const { data } = await axios.post<LoginResult>(
    `${API_BASE_URL}/api/auth/register`,
    {
      organizationName: params.organizationName,
      name: params.name,
      email: params.email,
      password: params.password,
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: AUTH_REQUEST_TIMEOUT_MS,
    }
  );
  return data;
}

export async function login(params: LoginParams): Promise<LoginResult> {
  const { data } = await axios.post<LoginResult>(
    `${API_BASE_URL}/api/auth/login`,
    { email: params.email, password: params.password },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: AUTH_REQUEST_TIMEOUT_MS,
    }
  );
  return data;
}
