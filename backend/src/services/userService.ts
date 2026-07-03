import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/pagination';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  role?: string;
}

export const userService = {
  async findAll(prisma: PrismaClient, params: FindAllParams) {
    const { page, limit, skip } = getPaginationParams(params.page, params.limit);

    const where: Prisma.UserWhereInput = {
      ...(params.search && {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.department && { department: params.department }),
      ...(params.role && { role: params.role as any }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          position: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(prisma: PrismaClient, id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async update(prisma: PrismaClient, id: string, data: any, _updatedBy: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  },

  async delete(prisma: PrismaClient, id: string, _deletedBy: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async getDepartments(prisma: PrismaClient): Promise<string[]> {
    const result = await prisma.user.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ['department'],
    });

    return result.map((r) => r.department!).filter(Boolean);
  },
};
