import { sendSuccess } from '../utils/apiResponse';
import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const { email, password, firstName, lastName, department, position } = req.body;
    const result = await prisma.$transaction(async (tx) => {
      const authService = await import('../services/authService');
      const user = await authService.authService.register(tx, { email, password, firstName, lastName, department, position });
      const token = authService.authService.generateToken(user);
      return { user, token };
    });
    sendSuccess(res, 'Registration successful', result, 201);
  },

  async login(req: AuthRequest, res: Response) {
    const { email, password } = req.body;
    const authService = await import('../services/authService');
    const result = await authService.authService.login(prisma, email, password);
    sendSuccess(res, 'Login successful', result);
  },

  async getProfile(req: AuthRequest, res: Response) {
    const authService = await import('../services/authService');
    const user = await authService.authService.getProfile(prisma, req.user!.userId);
    sendSuccess(res, 'Profile retrieved', { user });
  },
};
