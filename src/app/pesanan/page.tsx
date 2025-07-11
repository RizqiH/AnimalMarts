"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Edit3,
  Check,
  X,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  MessageCircle,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

// Type definitions
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface TrackingEvent {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  description: string;
  timestamp: string;
}

interface TrackingInfo {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  timeline: TrackingEvent[];
}

interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingInfo?: TrackingInfo;
  canReview?: boolean;
  notes?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    orders: Order[];
  };
}

type OrderStatus = Order["status"] | "all";

const OrdersPage: React.FC = () => {
  const { isAuthenticated, user, isAdmin, isLoading, getAuthHeaders } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ""
  });
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  // Fetch orders from database
  const fetchOrders = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";
      
      // Different endpoints for admin vs user
      const endpoint = isAdmin 
        ? `${API_URL}/api/orders?limit=100`
        : `${API_URL}/api/orders/user`;
      
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setOrders(result.data?.orders || []);
      } else {
        console.error("Failed to fetch orders:", result.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ): Promise<void> => {
    setUpdatingStatus(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : null,
          );
        }

        showNotification("Status pesanan berhasil diperbarui! 🎉", "success");
        setShowStatusModal(false);
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("Gagal memperbarui status pesanan 😞", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check if product has been reviewed
  const checkExistingReviews = async () => {
    if (!isAuthenticated) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";
      const response = await fetch(`${API_URL}/api/reviews/user`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const reviewedSet = new Set<string>();
          result.data.forEach((review: any) => {
            if (review.productId) {
              reviewedSet.add(review.productId);
            }
          });
          setReviewedProducts(reviewedSet);
        }
      }
    } catch (error) {
      console.error("Error checking existing reviews:", error);
    }
  };

  // Review functions
  const openReviewModal = (product: OrderItem, order: Order) => {
    if (order.status !== 'delivered') {
      showNotification("Review hanya tersedia untuk pesanan yang sudah diterima", "error");
      return;
    }
    
    if (reviewedProducts.has(product.id)) {
      showNotification("Anda sudah memberikan review untuk produk ini", "error");
      return;
    }
    
    setSelectedOrder(order);
    setSelectedProduct(product);
    setReviewData({ rating: 0, comment: "" });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedProduct || !selectedOrder) return;
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      showNotification("Rating harus antara 1-5 bintang", "error");
      return;
    }

    try {
      setUpdatingStatus(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";
      const token = localStorage.getItem("token");
      const headers: any = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId: selectedProduct.id,
          orderId: selectedOrder.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification("Review berhasil ditambahkan! 🎉", "success");
        setShowReviewModal(false);
        
        // Add product to reviewed products
        if (selectedProduct) {
          setReviewedProducts(prev => new Set(prev).add(selectedProduct.id));
        }
        
        setSelectedProduct(null);
        setReviewData({ rating: 0, comment: "" });
        fetchOrders(); // Refresh orders to update review status
        checkExistingReviews(); // Refresh review status
      } else {
        throw new Error(result.message || "Gagal menambahkan review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showNotification(
        error instanceof Error ? error.message : "Gagal menambahkan review",
        "error"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      checkExistingReviews();
    }
  }, [isAuthenticated, isAdmin]);

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const formatPrice = (amount: number): string => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateInput: string | Date | any): string => {
    try {
      let date: Date;

      if (!dateInput) {
        return "Tanggal tidak tersedia";
      }

      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else if (dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
      } else if (dateInput._seconds) {
        date = new Date(dateInput._seconds * 1000);
      } else {
        date = new Date(dateInput);
      }

      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateInput);
        return "Tanggal tidak valid";
      }

      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "Tanggal tidak valid";
    }
  };

  const getStatusBadge = (status: Order["status"]): React.ReactElement => {
    const statusConfig = {
      pending: {
        bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
        text: "text-yellow-800",
        ring: "ring-yellow-200",
        icon: Clock,
        label: "Menunggu",
      },
      confirmed: {
        bg: "bg-gradient-to-r from-blue-100 to-sky-100",
        text: "text-blue-800",
        ring: "ring-blue-200",
        icon: Check,
        label: "Dikonfirmasi",
      },
      processing: {
        bg: "bg-gradient-to-r from-purple-100 to-violet-100",
        text: "text-purple-800",
        ring: "ring-purple-200",
        icon: Package,
        label: "Diproses",
      },
      shipped: {
        bg: "bg-gradient-to-r from-indigo-100 to-blue-100",
        text: "text-indigo-800",
        ring: "ring-indigo-200",
        icon: Truck,
        label: "Dikirim",
      },
      delivered: {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        text: "text-green-800",
        ring: "ring-green-200",
        icon: CheckCircle,
        label: "Selesai",
      },
      cancelled: {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        text: "text-red-800",
        ring: "ring-red-200",
        icon: XCircle,
        label: "Dibatalkan",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ${config.bg} ${config.text} ${config.ring} transition-all duration-200 hover:scale-105`}
      >
        <IconComponent className="w-3.5 h-3.5 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const getStatusOptions = (
    currentStatus: Order["status"],
  ): Order["status"][] => {
    const statusFlow: Record<Order["status"], Order["status"][]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    return statusFlow[currentStatus] || [];
  };

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.customerInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const viewOrderDetails = (order: Order): void => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const openStatusModal = (order: Order): void => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const exportToCSV = (): void => {
    const headers = [
      "Order ID",
      "Tanggal",
      "Nama Customer",
      "Email",
      "Phone",
      "Total",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order: Order) =>
        [
          order.id,
          formatDate(order.createdAt),
          order.customerInfo?.name,
          order.customerInfo?.email,
          order.customerInfo?.phone,
          order.totalAmount,
          order.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk melihat pesanan Anda.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Login Sekarang
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
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
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm">
                <ShoppingBag className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isAdmin ? "Dashboard Pesanan" : "Pesanan Saya"}
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              {isAdmin 
                ? "Kelola dan pantau semua pesanan pelanggan AnimalMart dengan mudah"
                : "Pantau status pesanan dan riwayat pembelian Anda"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card-base p-4 sm:p-6 animate-scale-in stagger-delay-1 hover-lift group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Pesanan</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs sm:text-sm text-green-600 font-medium truncate">+{stats.confirmed} dikonfirmasi</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-base p-4 sm:p-6 animate-scale-in stagger-delay-2 hover-lift group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Menunggu Konfirmasi</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Perlu perhatian</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-base p-4 sm:p-6 animate-scale-in stagger-delay-3 hover-lift group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Sedang Diproses</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.processing + stats.shipped}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{stats.shipped} sedang dikirim</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-base p-4 sm:p-6 animate-scale-in stagger-delay-4 hover-lift group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs sm:text-sm text-green-500 font-medium truncate">+{stats.delivered} selesai</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="card-base p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in stagger-delay-5">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau Order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as OrderStatus)}
                  className="w-full sm:w-auto pl-10 pr-8 py-3 sm:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="confirmed">Dikonfirmasi</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
              <button
                onClick={fetchOrders}
                className="btn-secondary flex items-center justify-center space-x-2 hover-scale py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={exportToCSV}
                  className="btn-primary flex items-center justify-center space-x-2 hover-scale py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table/Cards */}
        <div className="card-base overflow-hidden animate-fade-in stagger-delay-6">
          {loading ? (
            <div className="p-8 sm:p-16 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-base sm:text-lg font-medium text-gray-600">Memuat data pesanan...</p>
                <p className="text-sm text-gray-500">Tunggu sebentar ya! ⏳</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 sm:p-16 text-center">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6 animate-scale-in">
                <div className="p-4 sm:p-6 bg-gray-100 rounded-full">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Belum ada pesanan</p>
                  <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "Tidak ada pesanan yang sesuai dengan filter Anda"
                      : "Pesanan pertama akan muncul di sini ketika pelanggan mulai berbelanja"
                    }
                  </p>
                </div>
                {(searchTerm || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                    className="btn-primary hover-scale px-6 py-3 text-sm sm:text-base"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Kontak
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order: Order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-900">#{order.id}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{order.customerInfo?.name}</p>
                              <p className="text-sm text-gray-500">{order.customerInfo?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{order.customerInfo?.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{order.customerInfo?.address?.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} item
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Detail
                              </button>
                              {isAdmin && getStatusOptions(order.status).length > 0 && (
                                <button
                                  onClick={() => openStatusModal(order)}
                                  className="inline-flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all duration-200 hover:scale-105"
                                >
                                  <Edit3 className="w-4 h-4 mr-1" />
                                  Status
                                </button>
                              )}
                            </div>
                            {!isAdmin && order.status === 'delivered' && (
                              <div className="flex flex-col gap-2">
                                {order.items?.map((item: OrderItem, index: number) => {
                                  const isReviewed = reviewedProducts.has(item.id);
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => openReviewModal(item, order)}
                                      disabled={isReviewed}
                                      className={`inline-flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                        isReviewed
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200 hover:from-orange-100 hover:to-amber-100 hover:scale-105'
                                      }`}
                                    >
                                      <Star className={`w-4 h-4 mr-1 ${isReviewed ? 'fill-current' : ''}`} />
                                      {isReviewed ? 'Sudah Direview' : `Review ${item.name}`}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="divide-y divide-gray-100">
                  {filteredOrders.map((order: Order, index) => (
                    <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">#{order.id}</p>
                            <p className="text-sm text-gray-500 truncate">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">{order.customerInfo?.name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{order.customerInfo?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{order.customerInfo?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{order.customerInfo?.address?.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Pesanan</p>
                          <p className="text-lg font-bold text-green-600">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold text-gray-900">{order.items?.length || 0} item</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 hover:scale-105 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </button>
                          {isAdmin && getStatusOptions(order.status).length > 0 && (
                            <button
                              onClick={() => openStatusModal(order)}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all duration-200 hover:scale-105 text-sm font-medium"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Ubah Status
                            </button>
                          )}
                        </div>
                        {!isAdmin && order.status === 'delivered' && (
                          <div className="flex flex-col gap-2">
                            {order.items?.map((item: OrderItem, index: number) => {
                              const isReviewed = reviewedProducts.has(item.id);
                              return (
                                <button
                                  key={index}
                                  onClick={() => openReviewModal(item, order)}
                                  disabled={isReviewed}
                                  className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                                    isReviewed
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200 hover:from-orange-100 hover:to-amber-100 hover:scale-105'
                                  }`}
                                >
                                  <Star className={`w-4 h-4 mr-2 ${isReviewed ? 'fill-current' : ''}`} />
                                  {isReviewed ? 'Sudah Direview' : `Review ${item.name}`}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-in mx-4">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Ubah Status Pesanan
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-2">
                  Order ID: <span className="font-semibold">#{selectedOrder.id}</span>
                </p>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Status saat ini:</span>
                  <div className="flex-shrink-0">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Pilih status baru:
                </p>
                {getStatusOptions(selectedOrder.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={updatingStatus}
                    className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0">
                        {getStatusBadge(status)}
                      </div>
                      {updatingStatus && (
                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 sm:px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl animate-scale-in mx-4">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Detail Pesanan
                  </h2>
                  <p className="text-gray-500 text-base sm:text-lg">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-base sm:text-lg">
                    <div className="p-2 bg-blue-500 rounded-xl mr-3 flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="truncate">Informasi Customer</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Nama</p>
                        <p className="font-semibold text-sm sm:text-base break-words text-gray-800">{selectedOrder.customerInfo?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-sm sm:text-base break-all text-gray-800">{selectedOrder.customerInfo?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Telepon</p>
                        <p className="font-semibold text-sm sm:text-base break-all text-gray-800">{selectedOrder.customerInfo?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="font-semibold text-sm sm:text-base break-words text-gray-800">
                          {typeof selectedOrder.customerInfo?.address === 'object' 
                            ? selectedOrder.customerInfo.address.street 
                            : selectedOrder.customerInfo?.address}
                        </p>
                        <p className="text-sm text-gray-500 break-words">
                          {selectedOrder.customerInfo?.address?.city}, {selectedOrder.customerInfo?.address?.province || "Indonesia"}
                        </p>
                        {selectedOrder.customerInfo?.address?.postalCode && (
                          <p className="text-sm text-gray-500">{selectedOrder.customerInfo.address.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status & Timeline */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-base sm:text-lg">
                    <div className="p-2 bg-green-500 rounded-xl mr-3 flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="truncate">Status Pesanan</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Status saat ini:</span>
                      <div className="flex-shrink-0 ">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Tanggal Order:</span>
                      <span className="font-semibold text-sm sm:text-base text-right text-gray-800">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Metode Pembayaran:</span>
                      <span className="font-semibold text-sm sm:text-base text-right break-words text-gray-800">{selectedOrder.paymentMethod}</span>
                    </div>
                    
                    {/* Tracking Timeline for customers */}
                    {!isAdmin && selectedOrder.trackingInfo && (
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                          Pelacakan Pesanan
                        </h4>
                        <div className="space-y-3">
                          {selectedOrder.trackingInfo.timeline.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6 sm:mt-8">
                <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 flex items-center text-lg sm:text-xl">
                  <div className="p-2 bg-purple-500 rounded-xl mr-3 flex-shrink-0">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="truncate">Produk yang Dibeli ({selectedOrder.items?.length || 0} item)</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {selectedOrder.items?.map((item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded-2xl hover-lift gap-3 sm:gap-4"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{item.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs sm:text-sm text-gray-500">
                                {item.quantity}x {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="font-semibold text-base sm:text-lg break-words">
                            Total: {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                                              </div>
                      ))}
                </div>
              </div>

                            {/* Payment Summary */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">Total Pembayaran:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 break-words">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>



              {/* Quick Status Update */}
              {isAdmin && getStatusOptions(selectedOrder.status).length > 0 && (
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl">
                  <h4 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">
                    Ubah Status Pesanan
                  </h4>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {getStatusOptions(selectedOrder.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={updatingStatus}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-scale text-sm sm:text-base"
                      >
                        {updatingStatus ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span>Ubah ke</span>
                            <div className="flex-shrink-0">
                              {getStatusBadge(status)}
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Debug Section - Force Status to Delivered for Testing Reviews */}
              {isAdmin && (
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl border border-red-200">
                  <h4 className="font-bold text-red-900 mb-4 text-base sm:text-lg">
                    🚨 Debug: Force Status untuk Test Review
                  </h4>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-scale text-sm sm:text-base"
                  >
                    {updatingStatus ? "Loading..." : "Set ke DELIVERED (untuk test review)"}
                  </button>
                  <p className="text-xs text-red-600 mt-2">
                    Gunakan tombol ini untuk memaksa status ke "delivered" agar tombol review muncul
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-in mx-4">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Beri Review
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600">
                  {formatPrice(selectedProduct.price)} x {selectedProduct.quantity}
                </p>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating (1-5 bintang) *
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      className={`w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
                        star <= reviewData.rating
                          ? 'text-orange-400 hover:text-orange-500'
                          : 'text-gray-300 hover:text-orange-300'
                      }`}
                    >
                      <Star className={`w-8 h-8 ${star <= reviewData.rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {reviewData.rating > 0 ? `${reviewData.rating} bintang` : 'Pilih rating'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Komentar (opsional)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewData.comment.length}/500 karakter
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewData.rating < 1 || updatingStatus}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    reviewData.rating < 1 || updatingStatus
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:scale-105'
                  }`}
                >
                  {updatingStatus ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    'Kirim Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
