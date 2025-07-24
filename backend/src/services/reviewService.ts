import { db, COLLECTIONS } from "../config/firebase";
import { Review, CreateReviewRequest, ProductReviewStats, ReviewWithUser } from "../types/review";
import { OrderService } from "./orderService";

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export class ReviewService {
  private collection = db.collection(COLLECTIONS.REVIEWS || "reviews");
  private orderService = new OrderService();

  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const snapshot = await this.collection
        .where("productId", "==", productId)
        .get();

      if (snapshot.empty) {
        return {
          averageRating: 0,
          totalReviews: 0,
        };
      }

      const reviews = snapshot.docs.map(doc => doc.data() as Review);
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
      };
    } catch (error) {
      console.error("Error getting product review stats:", error);
      return {
        averageRating: 0,
        totalReviews: 0,
      };
    }
  }

  async createReview(userId: string, userName: string, reviewData: CreateReviewRequest): Promise<Review> {
    try {
      const now = new Date();
      const review = {
        userId,
        userName,
        productId: reviewData.productId,
        orderId: reviewData.orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(review);
      return {
        id: docRef.id,
        ...review,
      };
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  async getReviewsByProduct(productId: string, limit: number = 10, offset: number = 0): Promise<ReviewWithUser[]> {
    try {
      console.log(`Fetching reviews for productId: ${productId}, limit: ${limit}, offset: ${offset}`);
      
      // Use simple query first, then add orderBy after index is created
      const snapshot = await this.collection
        .where("productId", "==", productId)
        .limit(limit)
        .get();

      console.log(`Found ${snapshot.docs.length} reviews for product ${productId}`);
      
      const results = snapshot.docs.map(doc => {
        const data = doc.data() as Review;
        // Convert Firestore Timestamp to ISO string for frontend
        const createdAt = (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : data.createdAt;
        
        return {
          id: doc.id,
          rating: data.rating,
          comment: data.comment,
          userName: data.userName,
          createdAt: createdAt,
        };
      });

      // Sort by createdAt desc in memory for now
      results.sort((a, b) => {
        // Handle Firestore Timestamp objects
        const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt);
        const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`Returning ${results.length} reviews`);
      return results;
    } catch (error) {
      console.error("Error getting reviews by product:", error);
      return [];
    }
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const snapshot = await this.collection
        .where("productId", "==", productId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
    } catch (error) {
      console.error("Error getting reviews by product ID:", error);
      return [];
    }
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const snapshot = await this.collection
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
    } catch (error) {
      console.error("Error getting reviews by user:", error);
      return [];
    }
  }

  async updateReview(reviewId: string, userId: string, updateData: { rating?: number; comment?: string }): Promise<Review | null> {
    try {
      const docRef = this.collection.doc(reviewId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const review = doc.data() as Review;
      
      // Check if the review belongs to the user
      if (review.userId !== userId) {
        throw new Error("Unauthorized to update this review");
      }

      const updatedData = {
        ...updateData,
        updatedAt: new Date(),
      };

      await docRef.update(updatedData);

      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Review;
    } catch (error) {
      console.error("Error updating review:", error);
      throw new Error("Failed to update review");
    }
  }

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    try {
      const docRef = this.collection.doc(reviewId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return false;
      }

      const review = doc.data() as Review;
      
      // Check if the review belongs to the user
      if (review.userId !== userId) {
        throw new Error("Unauthorized to delete this review");
      }

      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Failed to delete review");
    }
  }

  async canUserReviewOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      // Check if order exists and belongs to user
      const order = await this.orderService.getUserOrder(userId, orderId);
      if (!order) {
        return false;
      }

      // Check if order is delivered (only delivered orders can be reviewed)
      if (order.status !== "delivered") {
        return false;
      }

      // Check if user has already reviewed this order
      const existingReview = await this.collection
        .where("userId", "==", userId)
        .where("orderId", "==", orderId)
        .get();

      return existingReview.empty;
    } catch (error) {
      console.error("Error checking if user can review order:", error);
      return false;
    }
  }
} 