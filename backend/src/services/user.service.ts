import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../errors/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Retreives a user's email address by user ID.
   * Throws an operational 404 AppError if the account does not exist.
   */
  async getUserEmail(userId: string): Promise<string> {
    try {
      const email = await this.userRepository.findEmailById(userId);

      if (!email) {
        throw new AppError('User account not found.', 404);
      }

      return email;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(`Error in UserService fetching email for ID ${userId}:`, error);
      throw new AppError('Failed to retrieve user email details.', 500);
    }
  }
}
