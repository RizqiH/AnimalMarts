export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  imagePublicId?: string;
  bestseller: boolean;
  description?: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  price: number;
  description?: string;
  stock: number;
  bestseller?: boolean;
  image?: string;
  imagePublicId?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
  image?: string;
  imagePublicId?: string;
}
