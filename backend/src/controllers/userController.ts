import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { userService } from '../services/userService';

export const userController = {
  async findAll(req: AuthRequest, res: Response) {
    const { page, limit, search, department, role } = req.query;
    const result = await userService.findAll(prisma, {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      search: search as string,
      department: department as string,
      role: role as string,
    });
    sendSuccess(res, 'Users retrieved', result);
  },

  async findById(req: AuthRequest, res: Response) {
    const user = await userService.findById(prisma, req.params.id);
    sendSuccess(res, 'User retrieved', { user });
  },

  async update(req: AuthRequest, res: Response) {
    const user = await userService.update(prisma, req.params.id, req.body, req.user!.userId);
    sendSuccess(res, 'User updated', { user });
  },

  async delete(req: AuthRequest, res: Response) {
    await userService.delete(prisma, req.params.id, req.user!.userId);
    sendSuccess(res, 'User deactivated');
  },

  async getDepartments(req: AuthRequest, res: Response) {
    const departments = await userService.getDepartments(prisma);
    sendSuccess(res, 'Departments retrieved', { departments });
  },

  async updatePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const authService = await import('../services/authService');
    await authService.authService.updatePassword(prisma, req.user!.userId, currentPassword, newPassword);
    sendSuccess(res, 'Password updated successfully');
  },
};
