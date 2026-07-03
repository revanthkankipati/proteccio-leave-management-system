import { body } from 'express-validator';

export const createLeaveValidator = [
  body('leaveTypeId').isUUID().withMessage('Valid leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
];

export const updateLeaveStatusValidator = [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('comments').optional().trim(),
];
