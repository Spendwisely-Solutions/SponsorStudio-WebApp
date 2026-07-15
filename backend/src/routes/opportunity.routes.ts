import { Router } from 'express';
import { OpportunityController } from '../controllers/opportunity.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { CreateOpportunitySchema } from '../validators/opportunity.validator';

const router = Router();
const opportunityController = new OpportunityController();

// 1. Public route (unprotected)
router.get('/', opportunityController.getOpportunities);

// 2. Auth-secured route
router.get('/secure', authMiddleware, opportunityController.getSecureOpportunities);

// 3. Role-secured route (creator or event organizer only)
router.get(
  '/secure/creator',
  authMiddleware,
  requireRole('creator', 'event_organizer'),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Welcome! You have accessed the secure creator area.',
        role: req.user?.userType
      }
    });
  }
);

// 3b. Role-secured route (brand only)
router.get(
  '/secure/brand',
  authMiddleware,
  requireRole('brand'),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Welcome! You have accessed the secure brand area.'
      }
    });
  }
);

// 4. Payload-validated route (POST with Zod schema checks)
router.post(
  '/validate',
  validateBody(CreateOpportunitySchema),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Validation success! Payload matches the schema.',
        payload: req.body
      }
    });
  }
);

// 5. Unhandled exception route (triggers a 500 error boundary)
router.get('/error', (req, res) => {
  throw new Error('Simulated internal server crash.');
});

export default router;
