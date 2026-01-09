// src/controllers/userController.ts
import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { logger } from '../utils/logger.js';

const userService = new UserService();

export const getUserController = {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id}:`, error);
      next(error);
    }
  },

  // Additional controller methods...
};