import { PaymentMethod } from "../types/payment"; // Import the PaymentMethod type
export class PaymentService {
  // Daftar metode pembayaran yang tersedia
  private paymentMethods: PaymentMethod[] = [
    {
      id: "dana",
      name: "DANA",
      type: "e_wallet",
      icon: "dana-icon.png",
      description: "Bayar dengan DANA E-Wallet",
      isActive: true,
    },
    {
      id: "gopay",
      name: "GoPay",
      type: "e_wallet",
      icon: "gopay-icon.png",
      description: "Bayar dengan GoPay",
      isActive: true,
    },
    {
      id: "bca",
      name: "BCA Virtual Account",
      type: "bank_transfer",
      icon: "bca-icon.png",
      description: "Transfer ke Virtual Account BCA",
      isActive: true,
    },
    {
      id: "bni",
      name: "BNI Virtual Account",
      type: "bank_transfer",
      icon: "bni-icon.png",
      description: "Transfer ke Virtual Account BNI",
      isActive: true,
    },
    {
      id: "mandiri",
      name: "Mandiri Virtual Account",
      type: "bank_transfer",
      icon: "mandiri-icon.png",
      description: "Transfer ke Virtual Account Mandiri",
      isActive: true,
    },
    {
      id: "ovo",
      name: "OVO",
      type: "e_wallet",
      icon: "ovo-icon.png",
      description: "Bayar dengan OVO",
      isActive: true,
    },
    {
      id: "shopeepay",
      name: "ShopeePay",
      type: "e_wallet",
      icon: "shopeepay-icon.png",
      description: "Bayar dengan ShopeePay",
      isActive: true,
    },
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      type: "cash",
      icon: "cod-icon.png",
      description: "Bayar saat barang diterima",
      isActive: true,
    },
  ];

  // Ambil semua metode pembayaran yang aktif
  getAvailablePaymentMethods(): PaymentMethod[] {
    return this.paymentMethods.filter((method) => method.isActive);
  }

  // Ambil metode pembayaran berdasarkan tipe
  getPaymentMethodsByType(type: PaymentMethod["type"]): PaymentMethod[] {
    return this.paymentMethods.filter(
      (method) => method.type === type && method.isActive,
    );
  }

  // Ambil metode pembayaran berdasarkan ID
  getPaymentMethodById(id: string): PaymentMethod | null {
    return this.paymentMethods.find((method) => method.id === id) || null;
  }

  // Validasi apakah metode pembayaran valid
  isValidPaymentMethod(paymentMethodId: string): boolean {
    const method = this.getPaymentMethodById(paymentMethodId);
    return method !== null && method.isActive;
  }

  // Simulasi proses pembayaran (untuk formalitas)
  async processPayment(
    orderId: string,
    paymentMethodId: string,
    amount: number,
  ) {
    const method = this.getPaymentMethodById(paymentMethodId);

    if (!method) {
      throw new Error("Invalid payment method");
    }

    // Simulasi proses pembayaran
    const paymentResult = {
      orderId,
      paymentMethod: method.name,
      amount,
      status: "success", // Selalu sukses untuk formalitas
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date(),
      message: `Payment successful via ${method.name}`,
    };

    return paymentResult;
  }
}
