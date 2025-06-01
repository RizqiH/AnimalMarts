import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { ApiResponse } from "../types/common";

export class PaymentController {
  private paymentService = new PaymentService();

  getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    try {
      const methods = this.paymentService.getAvailablePaymentMethods();

      const response: ApiResponse<typeof methods> = {
        success: true,
        data: methods,
        message: "Payment methods retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve payment methods",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  processPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, paymentMethodId, amount } = req.body;

      const result = await this.paymentService.processPayment(
        orderId,
        paymentMethodId,
        amount,
      );

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: "Payment processed successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Payment processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(400).json(response);
    }
  };
}
