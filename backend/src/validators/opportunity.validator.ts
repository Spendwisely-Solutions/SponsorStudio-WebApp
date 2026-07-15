import { z } from 'zod';

/**
 * Validation schema for creating a new opportunity record (HTTP Body).
 */
export const CreateOpportunitySchema = z.object({
  title: z.string({
    required_error: 'Opportunity title is required.',
    invalid_type_error: 'Title must be a text string.'
  }).min(3, 'Title must be at least 3 characters long.'),

  description: z.string({
    required_error: 'Description details are required.'
  }).min(10, 'Description details must be at least 10 characters long.'),

  location: z.string({
    required_error: 'Location is required.'
  }).min(2, 'Location name must be at least 2 characters long.'),

  budget: z.number({
    required_error: 'Budget amount is required.',
    invalid_type_error: 'Budget must be a number.'
  }).positive('Budget amount must be a positive number.')
});

/**
 * Validation schema for route path parameters (like opportunity UUIDs).
 */
export const OpportunityIdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID.')
});
