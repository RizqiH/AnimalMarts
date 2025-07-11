export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId?: string; // Add user ID for authenticated orders
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
  trackingInfo?: TrackingInfo;
  canReview?: boolean; // Can user leave reviews for this order
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface TrackingInfo {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  timeline: TrackingEvent[];
}

export interface TrackingEvent {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  description: string;
  timestamp: Date;
}

export interface CreateOrderRequest {
  userId?: string; // Optional user ID for authenticated orders
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
