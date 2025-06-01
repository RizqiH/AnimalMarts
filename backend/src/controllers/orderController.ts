import { Request, Response } from "express";
import { OrderService } from "../services/orderService";
import { ApiResponse } from "../types/common";

export class OrderController {
  private orderService = new OrderService();

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.createOrder(req.body);

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order,
        message: "Order created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Order not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order,
        message: "Order retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve order",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.orderService.getAllOrders(page, limit);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: "Orders retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve orders",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await this.orderService.updateOrderStatus(id, status);

      if (!order) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Order not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order,
        message: "Order status updated successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to update order status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.cancelOrder(id);

      if (!order) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Order not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order,
        message: "Order cancelled successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to cancel order",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };

  getOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const orders = await this.orderService.getOrdersByStatus(status as any);

      const response: ApiResponse<typeof orders> = {
        success: true,
        data: orders,
        message: `Orders with status '${status}' retrieved successfully`,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve orders by status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.orderService.getOrderStats();

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: "Order statistics retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve order statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };
}
