import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Controller action to fetch a user's email address by ID.
   * Passes any thrown operational or system exceptions downstream using next(error).
   */
  getUserEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const email = await this.userService.getUserEmail(id);

      res.status(200).json({
        success: true,
        data: { email }
      });
    } catch (error) {
      next(error);
    }
  };
}
