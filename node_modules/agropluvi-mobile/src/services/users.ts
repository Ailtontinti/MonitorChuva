import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getToken } from './storage';

export type UserRole = 'owner' | 'admin' | 'user';

export interface UserItem {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

async function getClient() {
  const token = await getToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function listUsers(): Promise<UserItem[]> {
  const client = await getClient();
  const { data } = await client.get<UserItem[]>('/api/users');
  return data;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}): Promise<UserItem> {
  const client = await getClient();
  const { data } = await client.post<UserItem>('/api/users', input);
  return data;
}

export async function updateUser(
  id: string,
  input: Partial<Pick<UserItem, 'role' | 'isActive'>>,
): Promise<UserItem> {
  const client = await getClient();
  const { data } = await client.patch<UserItem>(`/api/users/${id}`, input);
  return data;
}

