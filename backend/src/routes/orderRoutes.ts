import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import {
  validate,
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validation/schemas";

const router = Router();
const orderController = new OrderController();

// Public routes
router.post("/", orderController.createOrder);
router.get("/:id", orderController.getOrderById);

// Admin routes (in a real app, you'd add authentication middleware here)
router.get("/", orderController.getAllOrders);
router.put(
  "/:id/status",
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);
router.delete("/:id", orderController.cancelOrder);
router.get("/stats/overview", orderController.getOrderStats);
router.get("/status/:status", orderController.getOrdersByStatus);

export default router;
