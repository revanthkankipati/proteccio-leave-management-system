import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma, Role, User } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
}

interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

export const authService = {
  async register(tx: Prisma.TransactionClient, input: RegisterInput): Promise<User> {
    const existing = await tx.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await tx.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        department: input.department,
        position: input.position,
      },
    });

    return user;
  },

  async login(prisma: PrismaClient, email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact your administrator.', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async getProfile(prisma: PrismaClient, userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  async updatePassword(prisma: PrismaClient, userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },
};
