import { PrismaClient, Prisma, LeaveStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthPayload } from '../types';
import { getPaginationParams } from '../utils/pagination';

interface CreateLeaveInput {
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

interface FindAllQuery {
  userId: string;
  role: string;
  page: number;
  limit: number;
  status?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateStatusInput {
  status: string;
  comments?: string;
  approverId: string;
}

export const leaveService = {
  async create(prisma: PrismaClient, input: CreateLeaveInput) {
    const leaveType = await prisma.leaveType.findUnique({ where: { id: input.leaveTypeId } });
    if (!leaveType || !leaveType.isActive) {
      throw new AppError('Invalid or inactive leave type', 400);
    }

    if (input.startDate >= input.endDate) {
      throw new AppError('End date must be after start date', 400);
    }

    if (input.reason.length < 10) {
      throw new AppError('Reason must be at least 10 characters', 400);
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: input.userId,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
      },
      include: {
        leaveType: { select: { name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
      },
    });

    return leave;
  },

  async findAll(prisma: PrismaClient, query: FindAllQuery) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: Prisma.LeaveRequestWhereInput = {
      ...(query.role === 'EMPLOYEE' && { userId: query.userId }),
      ...(query.status && { status: query.status as LeaveStatus }),
      ...(query.leaveTypeId && { leaveTypeId: query.leaveTypeId }),
      ...(query.startDate && { startDate: { gte: new Date(query.startDate) } }),
      ...(query.endDate && { endDate: { lte: new Date(query.endDate) } }),
    };

    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          leaveType: { select: { name: true, code: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
          approver: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: leaves,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(prisma: PrismaClient, id: string, user: AuthPayload) {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        leaveType: { select: { name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (user.role === 'EMPLOYEE' && leave.userId !== user.userId) {
      throw new AppError('Access denied', 403);
    }

    return leave;
  },

  async updateStatus(prisma: PrismaClient, id: string, input: UpdateStatusInput) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Can only update pending requests', 400);
    }

    const status = input.status as LeaveStatus;
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new AppError('Status must be APPROVED or REJECTED', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedLeave = await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          approverId: input.approverId,
          comments: input.comments,
        },
        include: {
          leaveType: { select: { name: true, code: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
          approver: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (status === 'APPROVED') {
        const daysDiff = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const year = leave.startDate.getFullYear();

        await tx.leaveBalance.updateMany({
          where: {
            userId: leave.userId,
            leaveTypeId: leave.leaveTypeId,
            year,
          },
          data: {
            usedDays: { increment: daysDiff },
          },
        });
      }

      return updatedLeave;
    });

    return updated;
  },

  async cancel(prisma: PrismaClient, id: string, userId: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.userId !== userId) {
      throw new AppError('You can only cancel your own leave requests', 403);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Can only cancel pending requests', 400);
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        leaveType: { select: { name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
      },
    });

    return updated;
  },

  async getBalance(prisma: PrismaClient, userId: string, year: number) {
    const balances = await prisma.leaveBalance.findMany({
      where: { userId, year },
      include: { leaveType: { select: { name: true, code: true } } },
    });

    return balances.map((b) => ({
      leaveTypeId: b.leaveTypeId,
      leaveTypeName: b.leaveType.name,
      leaveTypeCode: b.leaveType.code,
      totalDays: b.totalDays,
      usedDays: b.usedDays,
      remainingDays: b.totalDays - b.usedDays,
      year: b.year,
    }));
  },
};
