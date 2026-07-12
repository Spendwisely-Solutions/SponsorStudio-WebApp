import { Router } from 'express';
import { OpportunityController } from '../controllers/opportunity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const opportunityController = new OpportunityController();

// Maps GET /api/opportunities (Public route)
router.get('/', opportunityController.getOpportunities);

// Maps GET /api/opportunities/secure (Protected route requiring a valid JWT)
router.get('/secure', authMiddleware, opportunityController.getSecureOpportunities);

export default router;
