import { Router } from 'express';
import { leaveController } from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLeaveValidator, updateLeaveStatusValidator } from '../validators/leaveValidators';

const router = Router();

router.use(authenticate);

router.post('/', createLeaveValidator, validate, leaveController.create);

router.get('/', leaveController.findAll);

router.get('/balance', leaveController.getBalance);

router.get('/:id', leaveController.findById);

router.patch('/:id/status', authorize('MANAGER'), updateLeaveStatusValidator, validate, leaveController.updateStatus);

router.patch('/:id/cancel', leaveController.cancel);

export default router;
