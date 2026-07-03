import api from './api';
import type { AuthResponse, User } from '@/types';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', input);
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile');
    return data.data.user;
  },
};
