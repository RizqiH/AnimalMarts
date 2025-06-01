import { Request, Response } from "express";
import { CartService } from "../services/cartService";

export class CartController {
  private cartService = new CartService();

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, productId, quantity } = req.body;

      // Validation
      if (!userId || !productId || !quantity) {
        res.status(400).json({
          success: false,
          message: "userId, productId, and quantity are required",
        });
        return;
      }

      if (quantity < 1) {
        res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
        return;
      }

      const cart = await this.cartService.addToCart({
        userId,
        productId,
        quantity: parseInt(quantity),
      });

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: this.getErrorMessage(error) || "Failed to add item to cart",
      });
    }
  };

  getCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      const cart = await this.cartService.getCartByUserId(userId);

      res.status(200).json({
        success: true,
        data: cart || {
          items: [],
          totalAmount: 0,
          totalItems: 0,
        },
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: this.getErrorMessage(error) || "Failed to get cart",
      });
    }
  };

  updateCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, productId, quantity } = req.body;

      // Validation
      if (!userId || !productId || quantity === undefined) {
        res.status(400).json({
          success: false,
          message: "userId, productId, and quantity are required",
        });
        return;
      }

      const cart = await this.cartService.updateCartItem({
        userId,
        productId,
        quantity: parseInt(quantity),
      });

      res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({
        success: false,
        message: this.getErrorMessage(error) || "Failed to update cart item",
      });
    }
  };

  removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
        res.status(400).json({
          success: false,
          message: "userId and productId are required",
        });
        return;
      }

      const cart = await this.cartService.removeFromCart({
        userId,
        productId,
      });

      res.status(200).json({
        success: true,
        message: "Item removed from cart successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message:
          this.getErrorMessage(error) || "Failed to remove item from cart",
      });
    }
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      await this.cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: this.getErrorMessage(error) || "Failed to clear cart",
      });
    }
  };

  getCartStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      const stats = await this.cartService.getCartStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get cart stats error:", error);
      res.status(500).json({
        success: false,
        message: this.getErrorMessage(error) || "Failed to get cart stats",
      });
    }
  };
}
