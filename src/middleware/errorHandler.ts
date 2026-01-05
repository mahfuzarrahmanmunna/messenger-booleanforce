// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger = require('../utils/logger');

export  function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
}