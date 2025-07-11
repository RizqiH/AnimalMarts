"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  MessageCircle,
  ChevronRight,
  Package,
  Award,
  Users,
  Calendar,
  Tag,
  MapPin,
  Clock,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import ReviewSection from "../../components/ReviewSection";

// Types sesuai dengan backend
interface Product {
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
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: Product;
  message?: string;
  error?: string;
}

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const productId = params.id as string;

  // Fetch product data dari backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";
        const response = await fetch(`${API_URL}/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Produk tidak ditemukan");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          throw new Error(result.message || "Gagal memuat produk");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      // Add to cart multiple times if quantity > 1
      for (let i = 0; i < quantity; i++) {
        await addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }

      showNotification("Produk berhasil ditambahkan ke keranjang! 🛒", "success");
    } catch (error) {
      showNotification("Gagal menambahkan produk ke keranjang 😞", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600">Memuat detail produk...</p>
          <p className="text-sm text-gray-500">Tunggu sebentar ya! ⏳</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="p-6 bg-red-100 rounded-full w-fit mx-auto mb-6">
            <Package className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">
            {error || "Maaf, produk yang Anda cari tidak ditemukan atau sudah tidak tersedia."}
          </p>
          <button
            onClick={() => router.push("/product")}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Produk</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Floating Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in-right ${
            notification.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <ShoppingCart className="w-5 h-5" />
            ) : (
              <Package className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-green-100 mb-4">
            <button
              onClick={() => router.push("/")}
              className="hover:text-white transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => router.push("/product")}
              className="hover:text-white transition-colors"
            >
              Produk
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium truncate">{product.name}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-xl animate-fade-in">
              <Image
                src={product.image || "/assets/image/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  e.currentTarget.src = "/assets/image/placeholder.jpg";
                }}
              />
              
              {/* Bestseller Badge */}
              {product.bestseller && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Terlaris
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                  isFavorite
                    ? "bg-red-500 text-white scale-110"
                    : "bg-white/80 text-gray-600 hover:bg-white hover:scale-110"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in stagger-delay-1">
            {/* Product Title & Category */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {product.isActive && (
                  <span className="bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Tersedia
                  </span>
                )}
                {!product.isActive && (
                  <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Tidak Aktif
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">ID: {product.id}</p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {product.rating}/5
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{product.reviews} ulasan</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl lg:text-4xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Ditambahkan: {formatDate(product.createdAt)}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded-xl bg-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2  hover:bg-gray-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !product.isActive}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Menambahkan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Tambah ke Keranjang</span>
                    </>
                  )}
                </button>

                <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
                  <Share2 className="w-5 h-5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Gratis Ongkir</p>
                  <p className="text-xs text-gray-500">Min. pembelian 100k</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Garansi Kualitas</p>
                  <p className="text-xs text-gray-500">100% original</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pengiriman Cepat</p>
                  <p className="text-xs text-gray-500">1-2 hari kerja</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12 space-y-8">
          {/* Description */}
          {product.description && (
            <div className="card-base p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-green-500 rounded-xl mr-3">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                Deskripsi Produk
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {showFullDescription || product.description.length <= 300
                    ? product.description
                    : `${product.description.substring(0, 300)}...`}
                </p>
                {product.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-green-600 hover:text-green-700 font-medium mt-4"
                  >
                    {showFullDescription ? "Tampilkan Lebih Sedikit" : "Baca Selengkapnya"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="card-base p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-blue-500 rounded-xl mr-3">
                <Award className="w-5 h-5 text-white" />
              </div>
              Informasi Produk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Kategori</span>
                  <span className="font-medium text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bestseller</span>
                  <span className={`font-medium ${product.bestseller ? 'text-orange-600' : 'text-gray-900'}`}>
                    {product.bestseller ? 'Ya' : 'Tidak'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium text-gray-900">{product.rating}/5</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium text-gray-900">{product.reviews} ulasan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Completely Separate Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ReviewSection productId={productId} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 