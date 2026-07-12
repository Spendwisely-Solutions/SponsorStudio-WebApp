import { OpportunityRepository } from '../repositories/opportunity.repository';

export class OpportunityService {
  private opportunityRepository: OpportunityRepository;

  constructor() {
    this.opportunityRepository = new OpportunityRepository();
  }

  /**
   * Retrieves all opportunities.
   * Place any business logic (filtering, validation, custom formatting) here.
   */
  async getOpportunities() {
    const opportunities = await this.opportunityRepository.findAll();
    
    // Example business logic transformation (e.g., stripping private values or enriching fields)
    return opportunities;
  }
}
