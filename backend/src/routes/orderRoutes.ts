import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  validate,
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validation/schemas";

const router = Router();
const orderController = new OrderController();

// Public routes
router.post("/", authMiddleware.optionalAuth, validate(createOrderSchema), orderController.createOrder);

// User routes - require authentication
router.get("/user", authMiddleware.authenticateToken, orderController.getUserOrders);
router.get("/user/:id", authMiddleware.authenticateToken, orderController.getUserOrder);

// Admin routes - require admin authentication
router.get("/", authMiddleware.authenticateToken, authMiddleware.requireAdmin, orderController.getAllOrders);
router.get("/admin/:id", authMiddleware.authenticateToken, authMiddleware.requireAdmin, orderController.getOrderById);
router.put(
  "/:id/status",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);
router.delete("/:id", authMiddleware.authenticateToken, authMiddleware.requireAdmin, orderController.cancelOrder);
router.get("/stats/overview", authMiddleware.authenticateToken, authMiddleware.requireAdmin, orderController.getOrderStats);
router.get("/status/:status", authMiddleware.authenticateToken, authMiddleware.requireAdmin, orderController.getOrdersByStatus);

export default router;
