import { Request, Response } from 'express';
import { OpportunityService } from '../services/opportunity.service';

export class OpportunityController {
  private opportunityService: OpportunityService;

  constructor() {
    this.opportunityService = new OpportunityService();
  }

  /**
   * Handles fetching all opportunities and sending an HTTP response.
   * Bound as an arrow function to preserve instance context when registered in Express.
   */
  getOpportunities = async (req: Request, res: Response): Promise<void> => {
    try {
      const opportunities = await this.opportunityService.getOpportunities();
      
      res.status(200).json({
        success: true,
        count: opportunities.length,
        data: opportunities
      });
    } catch (error) {
      console.error('Error fetching opportunities in Controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve opportunities.'
      });
    }
  };

  /**
   * Endpoint protected by authMiddleware for verifying JWT validation.
   * Responds with the verified user structure to confirm session details.
   */
  getSecureOpportunities = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Access granted. Welcome to the secured API route!',
        user: req.user
      });
    } catch (error) {
      console.error('Error handling secure endpoint request in Controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'An internal error occurred while loading secure content.'
      });
    }
  };
}
