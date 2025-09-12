import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Define the shape of the user object in JWT
interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authorization token missing'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Attach decoded user to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
