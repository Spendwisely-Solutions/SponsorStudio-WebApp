import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Maps GET /api/users/:id/email (requires authenticated caller)
router.get('/:id/email', authMiddleware, userController.getUserEmail);

export default router;
