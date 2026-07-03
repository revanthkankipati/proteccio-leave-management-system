import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { leaveService } from '../services/leaveService';

export const leaveController = {
  async create(req: AuthRequest, res: Response) {
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    const leave = await leaveService.create(prisma, {
      userId: req.user!.userId,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });
    sendSuccess(res, 'Leave request submitted', { leave }, 201);
  },

  async findAll(req: AuthRequest, res: Response) {
    const { page, limit, status, leaveTypeId, startDate, endDate } = req.query;
    const result = await leaveService.findAll(prisma, {
      userId: req.user!.userId,
      role: req.user!.role,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      status: status as string,
      leaveTypeId: leaveTypeId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    sendSuccess(res, 'Leave requests retrieved', result);
  },

  async findById(req: AuthRequest, res: Response) {
    const leave = await leaveService.findById(prisma, req.params.id, req.user!);
    sendSuccess(res, 'Leave request retrieved', { leave });
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const { status, comments } = req.body;
    const leave = await leaveService.updateStatus(prisma, req.params.id, {
      status,
      comments,
      approverId: req.user!.userId,
    });
    sendSuccess(res, `Leave request ${status.toLowerCase()}`, { leave });
  },

  async cancel(req: AuthRequest, res: Response) {
    const leave = await leaveService.cancel(prisma, req.params.id, req.user!.userId);
    sendSuccess(res, 'Leave request cancelled', { leave });
  },

  async getBalance(req: AuthRequest, res: Response) {
    const { userId, year } = req.query;
    const targetUserId = (userId as string) || req.user!.userId;
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    const balances = await leaveService.getBalance(prisma, targetUserId, targetYear);
    sendSuccess(res, 'Leave balance retrieved', { balances });
  },
};
