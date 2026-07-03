import { body } from 'express-validator';

export const updateUserValidator = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['EMPLOYEE', 'MANAGER']).withMessage('Role must be EMPLOYEE or MANAGER'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updatePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];
