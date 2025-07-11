"use client";

import React, { useState, useEffect } from "react";
import { Star, User, MessageCircle, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewStats {
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

interface ReviewSectionProps {
  productId: string;
  orderId?: string;
  canReview?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";

export default function ReviewSection({ productId, orderId, canReview = false }: ReviewSectionProps) {
  const { isAuthenticated, user, getAuthHeaders } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews and stats
  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviewStats(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !orderId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId,
          orderId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewReview({ rating: 5, comment: "" });
          setShowReviewForm(false);
          fetchReviews();
          fetchReviewStats();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal mengirim review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Terjadi kesalahan saat mengirim review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewStats) return null;

    const total = reviewStats.totalReviews;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-3">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">
            Reviews & Rating
          </h3>
        </div>
        
        {canReview && isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tulis Review
          </button>
        )}
      </div>

      {/* Review Stats */}
      {reviewStats && reviewStats.totalReviews > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {reviewStats.averageRating.toFixed(1)}
            </div>
            {renderStars(reviewStats.averageRating, "lg")}
            <div className="text-sm text-gray-600 mt-2">
              Berdasarkan {reviewStats.totalReviews} review
            </div>
          </div>
          <div className="space-y-2">
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Tulis Review Anda</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`w-8 h-8 transition-colors ${
                      star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Komentar
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
                rows={4}
                placeholder="Bagikan pengalaman Anda dengan produk ini..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Review"}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada review untuk produk ini.</p>
            {canReview && isAuthenticated && (
              <p className="text-sm text-gray-400 mt-2">
                Jadilah yang pertama memberikan review!
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-800">{review.userName}</h5>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating, "sm")}
                        <span className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 