import api from './api';
import type { User, PaginatedResponse } from '@/types';

export const userService = {
  async findAll(params?: { page?: number; limit?: number; search?: string; department?: string; role?: string }): Promise<PaginatedResponse<User>> {
    const { data } = await api.get('/users', { params });
    return data.data;
  },

  async findById(id: string): Promise<User> {
    const { data } = await api.get(`/users/${id}`);
    return data.data.user;
  },

  async update(id: string, input: Partial<User>): Promise<User> {
    const { data } = await api.put(`/users/${id}`, input);
    return data.data.user;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getDepartments(): Promise<string[]> {
    const { data } = await api.get('/users/departments');
    return data.data.departments;
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/password/update', { currentPassword, newPassword });
  },
};
