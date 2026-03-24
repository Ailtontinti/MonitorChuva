import axios from 'axios';

import { API_BASE_URL } from '../config/api';

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
      timeout: 12000,
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
      timeout: 12000,
    }
  );
  return data;
}
