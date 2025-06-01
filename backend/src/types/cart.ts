export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  userId: string;
  productId: string;
}
