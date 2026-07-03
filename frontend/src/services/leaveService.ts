import api from './api';
import type { LeaveRequest, LeaveBalance, PaginatedResponse } from '@/types';

export const leaveService = {
  async create(input: { leaveTypeId: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> {
    const { data } = await api.post('/leaves', input);
    return data.data;
  },

  async findAll(params?: { page?: number; limit?: number; status?: string; leaveTypeId?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<LeaveRequest>> {
    const { data } = await api.get('/leaves', { params });
    return data.data;
  },

  async findById(id: string): Promise<LeaveRequest> {
    const { data } = await api.get(`/leaves/${id}`);
    return data.data.leave;
  },

  async updateStatus(id: string, status: string, comments?: string): Promise<LeaveRequest> {
    const { data } = await api.patch(`/leaves/${id}/status`, { status, comments });
    return data.data.leave;
  },

  async cancel(id: string): Promise<LeaveRequest> {
    const { data } = await api.patch(`/leaves/${id}/cancel`);
    return data.data.leave;
  },

  async getBalance(userId?: string, year?: number): Promise<LeaveBalance[]> {
    const { data } = await api.get('/leaves/balance', { params: { userId, year } });
    return data.data.balances;
  },
};
