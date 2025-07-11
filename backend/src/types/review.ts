export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number; // 1-5
  comment: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
} 