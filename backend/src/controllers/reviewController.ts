import { Request, Response } from "express";
import { ReviewService } from "../services/reviewService";
import { CreateReviewRequest } from "../types/review";
import { ApiResponse } from "../types/common";

export class ReviewController {
  private reviewService = new ReviewService();

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userName = req.user?.name;

      if (!userId || !userName) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User authentication required",
        };
        res.status(401).json(response);
        return;
      }

      const { productId, orderId, rating, comment }: CreateReviewRequest = req.body;

      // Validate input
      if (!productId || !orderId || !rating) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product ID, order ID, and rating are required",
        };
        res.status(400).json(response);
        return;
      }

      const review = await this.reviewService.createReview(userId, userName, {
        productId,
        orderId,
        rating,
        comment: comment || "",
      });

      const response: ApiResponse<typeof review> = {
        success: true,
        data: review,
        message: "Review created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create review",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!productId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product ID is required",
        };
        res.status(400).json(response);
        return;
      }

      const reviews = await this.reviewService.getReviewsByProduct(productId, limit, offset);

      const response: ApiResponse<typeof reviews> = {
        success: true,
        data: reviews,
        message: "Reviews retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to get product reviews",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getProductReviewStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;

      if (!productId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product ID is required",
        };
        res.status(400).json(response);
        return;
      }

      const stats = await this.reviewService.getProductReviewStats(productId);

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: "Review stats retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to get review stats",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getUserReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User authentication required",
        };
        res.status(401).json(response);
        return;
      }

      const reviews = await this.reviewService.getReviewsByUser(userId);

      const response: ApiResponse<typeof reviews> = {
        success: true,
        data: reviews,
        message: "User reviews retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to get user reviews",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User authentication required",
        };
        res.status(401).json(response);
        return;
      }

      if (!reviewId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Review ID is required",
        };
        res.status(400).json(response);
        return;
      }

      const updatedReview = await this.reviewService.updateReview(reviewId, userId, {
        rating,
        comment,
      });

      if (!updatedReview) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Review not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof updatedReview> = {
        success: true,
        data: updatedReview,
        message: "Review updated successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update review",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { reviewId } = req.params;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User authentication required",
        };
        res.status(401).json(response);
        return;
      }

      if (!reviewId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Review ID is required",
        };
        res.status(400).json(response);
        return;
      }

      const success = await this.reviewService.deleteReview(reviewId, userId);

      if (!success) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Review not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Review deleted successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete review",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  canReviewOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "User authentication required",
        };
        res.status(401).json(response);
        return;
      }

      if (!orderId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Order ID is required",
        };
        res.status(400).json(response);
        return;
      }

      const canReview = await this.reviewService.canUserReviewOrder(userId, orderId);

      const response: ApiResponse<{ canReview: boolean }> = {
        success: true,
        data: { canReview },
        message: canReview ? "User can review this order" : "User has already reviewed this order",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to check review status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };
} 