import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Admin creation route (optional auth - untuk setup admin pertama)
router.post("/create-admin", authMiddleware.optionalAuth, authController.createAdmin);

// Protected routes
router.get("/profile", authMiddleware.authenticateToken, authController.getProfile);
router.put("/profile", authMiddleware.authenticateToken, authController.updateProfile);
router.get("/validate", authMiddleware.authenticateToken, authController.validateToken);

export default router; 