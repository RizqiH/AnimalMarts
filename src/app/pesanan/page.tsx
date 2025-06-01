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
} from "lucide-react";

// Type definitions
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}

interface OrderItem {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
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

const AdminOrdersPage: React.FC = () => {
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

  // Fetch orders from database
  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      // Gunakan environment variable untuk API URL
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/orders?limit=100`);

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
      // Opsional: tampilkan notifikasi error ke user
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
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
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

        // Update selected order if it's the one being updated
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

        showNotification("Status pesanan berhasil diperbarui!", "success");
        setShowStatusModal(false);
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("Gagal memperbarui status pesanan", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

      // Handle berbagai tipe input
      if (!dateInput) {
        return "Tanggal tidak tersedia";
      }

      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else if (dateInput.seconds) {
        // Handle Firestore Timestamp
        date = new Date(dateInput.seconds * 1000);
      } else if (dateInput._seconds) {
        // Handle Firestore Timestamp format lain
        date = new Date(dateInput._seconds * 1000);
      } else {
        // Coba parse sebagai string
        date = new Date(dateInput);
      }

      // Cek apakah tanggal valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateInput);
        return "Tanggal tidak valid";
      }

      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
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
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Menunggu",
      },
      confirmed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Dikonfirmasi",
      },
      processing: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Diproses",
      },
      shipped: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "Dikirim",
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Selesai",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Dibatalkan",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusOptions = (
    currentStatus: Order["status"],
  ): Order["status"][] => {
    // Define allowed status transitions
    const statusFlow: Record<Order["status"], Order["status"][]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [], // No further transitions
      cancelled: [], // No further transitions
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}

      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Total Pesanan</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Menunggu</p>
                <p className="text-xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Dikonfirmasi</p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.confirmed}
                </p>
              </div>
              <Check className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Diproses</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.processing}
                </p>
              </div>
              <Package className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Selesai</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Revenue</p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <User className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau Order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OrderStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Tidak ada data pesanan</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerInfo?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerInfo?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.customerInfo?.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerInfo?.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </button>
                          {getStatusOptions(order.status).length > 0 && (
                            <button
                              onClick={() => openStatusModal(order)}
                              className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Ubah Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Ubah Status Pesanan
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Order ID: #{selectedOrder.id}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Status saat ini: {getStatusBadge(selectedOrder.status)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Pilih status baru:
                </p>
                {getStatusOptions(selectedOrder.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={updatingStatus}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      {getStatusBadge(status)}
                      {updatingStatus && (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Detail Pesanan #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Informasi Customer
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nama:</p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Telepon:</p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kota:</p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo?.city}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Alamat:</p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo?.address}
                    </p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Catatan:</p>
                      <p className="font-medium">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Produk yang Dibeli
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map(
                    (item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantity}x {formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-gray-600">Metode Pembayaran:</span>
                    <span className="font-medium">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Order:</span>
                    <span className="font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  {selectedOrder.updatedAt &&
                    selectedOrder.updatedAt !== selectedOrder.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terakhir Update:</span>
                        <span className="font-medium">
                          {formatDate(selectedOrder.updatedAt)}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Quick Status Update in Detail Modal */}
              {getStatusOptions(selectedOrder.status).length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Ubah Status Pesanan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getStatusOptions(selectedOrder.status).map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, status)
                        }
                        disabled={updatingStatus}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </div>
                        ) : (
                          <>Ubah ke {getStatusBadge(status)}</>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
