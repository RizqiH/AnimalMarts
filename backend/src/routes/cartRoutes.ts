import { Router } from "express";
import { CartController } from "../controllers/cartController";

const router = Router();
const cartController = new CartController();

// Cart routes
router.post("/add", cartController.addToCart); // POST /api/cart/add
router.get("/:userId", cartController.getCart); // GET /api/cart/:userId
router.put("/update", cartController.updateCartItem); // PUT /api/cart/update
router.delete("/remove", cartController.removeFromCart); // DELETE /api/cart/remove
router.delete("/clear/:userId", cartController.clearCart); // DELETE /api/cart/clear/:userId
router.get("/stats/:userId", cartController.getCartStats); // GET /api/cart/stats/:userId

export default router;
