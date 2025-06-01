import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";

const router = Router();
const paymentController = new PaymentController();

// GET /api/payments/methods - Ambil semua metode pembayaran
router.get("/methods", paymentController.getPaymentMethods);

// POST /api/payments/process - Proses pembayaran (simulasi)
router.post("/process", paymentController.processPayment);

// GET /api/payments/methods/:type - Ambil metode pembayaran berdasarkan tipe
router.get("/methods/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const paymentService = new (
      await import("../services/paymentService")
    ).PaymentService();
    const methods = paymentService.getPaymentMethodsByType(type as any);

    res.json({
      success: true,
      data: methods,
      message: `Payment methods for ${type} retrieved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment methods",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
