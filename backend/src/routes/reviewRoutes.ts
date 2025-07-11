import { Router } from "express";
import { ReviewController } from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/product/:productId/stats", reviewController.getProductReviewStats);

// Protected routes - require authentication
router.post("/", authMiddleware.authenticateToken, reviewController.createReview);
router.get("/user", authMiddleware.authenticateToken, reviewController.getUserReviews);
router.put("/:reviewId", authMiddleware.authenticateToken, reviewController.updateReview);
router.delete("/:reviewId", authMiddleware.authenticateToken, reviewController.deleteReview);
router.get("/can-review/:orderId", authMiddleware.authenticateToken, reviewController.canReviewOrder);

export default router; 