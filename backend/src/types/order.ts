export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };
  paymentMethod: "bank_transfer" | "credit_card" | "e_wallet" | "cod";
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface CreateOrderRequest {
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };
  paymentMethod: "bank_transfer" | "credit_card" | "e_wallet" | "cod";
  notes?: string;
}
