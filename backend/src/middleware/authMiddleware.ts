import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse } from "../types/common";
import { AuthUser } from "../types/user";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class AuthMiddleware {
  private authService = new AuthService();

  // Middleware to verify JWT token and set user in request
  authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Access token required",
        };
        res.status(401).json(response);
        return;
      }

      // Verify token
      const user = this.authService.verifyToken(token);
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Invalid or expired token",
        };
        res.status(401).json(response);
        return;
      }

      // Validate user still exists and is active
      const validUser = await this.authService.validateUser(user.id);
      if (!validUser) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User no longer exists or is inactive",
        };
        res.status(401).json(response);
        return;
      }

      // Set user in request
      req.user = validUser;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      const response: ApiResponse<null> = {
        success: false,
        message: "Authentication failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  // Middleware to check if user is admin
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Authentication required",
        };
        res.status(401).json(response);
        return;
      }

      if (user.role !== 'admin') {
        const response: ApiResponse<null> = {
          success: false,
          message: "Admin access required",
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      const response: ApiResponse<null> = {
        success: false,
        message: "Authorization failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  // Middleware to check if user is customer
  requireCustomer = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Authentication required",
        };
        res.status(401).json(response);
        return;
      }

      if (user.role !== 'customer') {
        const response: ApiResponse<null> = {
          success: false,
          message: "Customer access required",
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      console.error("Customer middleware error:", error);
      const response: ApiResponse<null> = {
        success: false,
        message: "Authorization failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  // Optional authentication middleware (doesn't fail if no token)
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const user = this.authService.verifyToken(token);
        if (user) {
          const validUser = await this.authService.validateUser(user.id);
          if (validUser) {
            req.user = validUser;
          }
        }
      }

      next();
    } catch (error) {
      console.error("Optional auth middleware error:", error);
      // Continue without authentication
      next();
    }
  };
}

// Export middleware instance
export const authMiddleware = new AuthMiddleware(); 