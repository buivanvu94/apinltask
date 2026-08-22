import { apiClient } from './api-client';
import { User } from '../types/auth';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface UpdateUserInput {
  name?: string;
  role?: 'ADMIN' | 'USER';
}

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await apiClient.post<User>('/users', input);
  return response.data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}`, input);
  return response.data;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/users/${id}/reset-password`, { newPassword });
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
