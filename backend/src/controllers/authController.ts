import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { LoginRequest, RegisterRequest } from "../types/user";
import { ApiResponse } from "../types/common";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password || !name) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Email, password, and name are required",
        };
        res.status(400).json(response);
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Password must be at least 6 characters long",
        };
        res.status(400).json(response);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Invalid email format",
        };
        res.status(400).json(response);
        return;
      }

      const user = await this.authService.register({ email, password, name });

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        message: "User registered successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      // Check if user is admin (optional, dapat di-skip untuk setup pertama)
      const currentUser = (req as any).user;
      if (currentUser && currentUser.role !== 'admin') {
        const response: ApiResponse<null> = {
          success: false,
          message: "Only admin can create other admin accounts",
        };
        res.status(403).json(response);
        return;
      }

      // Validate input
      if (!email || !password || !name) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Email, password, and name are required",
        };
        res.status(400).json(response);
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Password must be at least 6 characters long",
        };
        res.status(400).json(response);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Invalid email format",
        };
        res.status(400).json(response);
        return;
      }

      const admin = await this.authService.createUser({ 
        email, 
        password, 
        name, 
        role: 'admin' 
      });

      const response: ApiResponse<typeof admin> = {
        success: true,
        data: admin,
        message: "Admin account created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Admin creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Email and password are required",
        };
        res.status(400).json(response);
        return;
      }

      const loginResult = await this.authService.login({ email, password });

      const response: ApiResponse<typeof loginResult> = {
        success: true,
        data: loginResult,
        message: "Login successful",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(401).json(response);
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const user = await this.authService.getUserById(userId);

      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      const response: ApiResponse<typeof userWithoutPassword> = {
        success: true,
        data: userWithoutPassword,
        message: "Profile retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to get profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const updates = req.body;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      // Remove sensitive fields from updates
      delete updates.id;
      delete updates.role; // Role can only be changed by admin
      delete updates.createdAt;

      const updatedUser = await this.authService.updateUser(userId, updates);

      if (!updatedUser) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof updatedUser> = {
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authUser = (req as any).user;

      if (!authUser) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Token is invalid",
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse<typeof authUser> = {
        success: true,
        data: authUser,
        message: "Token is valid",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Token validation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };
} 