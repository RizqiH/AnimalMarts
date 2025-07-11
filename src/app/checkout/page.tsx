"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Check,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Lock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// API Base URL - sesuaikan dengan backend Anda
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-animalmart.vercel.app";

const AnimalMartCheckout = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();
  
  const { isAuthenticated, user, isLoading } = useAuth();

  const [paymentMethods] = useState([
    { id: "dana", name: "DANA", type: "e_wallet", icon: "💳" },
    { id: "gopay", name: "GoPay", type: "e_wallet", icon: "📱" },
    { id: "ovo", name: "OVO", type: "e_wallet", icon: "🟠" },
    {
      id: "bca",
      name: "BCA Virtual Account",
      type: "bank_transfer",
      icon: "🏦",
    },
    {
      id: "bni",
      name: "BNI Virtual Account",
      type: "bank_transfer",
      icon: "🏦",
    },
    {
      id: "mandiri",
      name: "Mandiri Virtual Account",
      type: "bank_transfer",
      icon: "🏦",
    },
    { id: "cod", name: "Cash on Delivery", type: "cash", icon: "💵" },
  ]);

  const [selectedPayment, setSelectedPayment] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  // Auto-fill customer info from logged in user
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const totalAmount = getCartTotal();
  const shippingCost = 25000;
  const finalTotal = totalAmount + shippingCost;

  const formatPrice = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // Map payment method ID to backend type
  const getPaymentMethodType = (paymentId: string): string => {
    const method = paymentMethods.find(m => m.id === paymentId);
    if (!method) return "cod"; // fallback
    
    switch (method.type) {
      case "e_wallet":
        return "e_wallet";
      case "bank_transfer":
        return "bank_transfer";
      case "cash":
        return "cod";
      default:
        return "cod";
    }
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Enhanced validation function
  const validateOrderData = (orderData: any) => {
    const errors = [];

    // Validate required customer info
    if (
      !orderData.customerInfo.name ||
      orderData.customerInfo.name.trim() === ""
    ) {
      errors.push("Nama pelanggan wajib diisi");
    }

    if (
      !orderData.customerInfo.email ||
      orderData.customerInfo.email.trim() === ""
    ) {
      errors.push("Email pelanggan wajib diisi");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      orderData.customerInfo.email &&
      !emailRegex.test(orderData.customerInfo.email)
    ) {
      errors.push("Format email tidak valid");
    }

    // Validate payment method
    if (!orderData.paymentMethod || orderData.paymentMethod.trim() === "") {
      errors.push("Metode pembayaran wajib dipilih");
    }

    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      errors.push("Keranjang kosong");
    }

    // Validate each item
    orderData.items.forEach((item: any, index: number) => {
      if (!item.id) errors.push(`Item ${index + 1}: ID produk tidak valid`);
      if (!item.name) errors.push(`Item ${index + 1}: Nama produk tidak valid`);
      if (!item.price || item.price <= 0)
        errors.push(`Item ${index + 1}: Harga produk tidak valid`);
      if (!item.quantity || item.quantity <= 0)
        errors.push(`Item ${index + 1}: Jumlah produk tidak valid`);
    });

    return errors;
  };

  // Enhanced order submission function
  const handleSubmitOrder = async () => {
    // Clear previous errors and debug info
    setError("");
    setDebugInfo("");

    // Basic validation
    if (!selectedPayment || !customerInfo.name || !customerInfo.email || !customerInfo.city || !customerInfo.province || !customerInfo.postalCode || !customerInfo.address) {
      setError("Mohon lengkapi semua field yang wajib diisi (bertanda *)");
      return;
    }

    if (cartItems.length === 0) {
      setError("Keranjang Anda kosong");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data with enhanced validation and proper image handling
      // Note: userId will be added by backend from authenticated token
      const orderData: any = {
        items: cartItems.map((item) => {
          const itemData: any = {
            id: item.id,
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
          };

          // Only include image if it exists and is not empty
          if (item.image && item.image.trim() !== "") {
            itemData.image = item.image.trim();
          }

          return itemData;
        }),
        customerInfo: {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim().toLowerCase(),
          phone: customerInfo.phone.trim(),
          address: {
            street: customerInfo.address.trim(),
            city: customerInfo.city.trim(),
            province: customerInfo.province.trim(),
            postalCode: customerInfo.postalCode.trim(),
          },
        },
        paymentMethod: getPaymentMethodType(selectedPayment),
        notes: "", // Empty string is now allowed by backend
      };

      // Validate order data
      const validationErrors = validateOrderData(orderData);
      if (validationErrors.length > 0) {
        setError(`Validasi gagal: ${validationErrors.join(", ")}`);
        setIsProcessing(false);
        return;
      }

      // Debug information
      setDebugInfo(`Mengirim data ke: ${API_BASE_URL}/orders`);
      console.log("=== ORDER DEBUG INFO ===");
      console.log("API URL:", `${API_BASE_URL}/orders`);
      console.log("Order Data:", JSON.stringify(orderData, null, 2));
      console.log("========================");

      // Send to backend with enhanced error handling
      const token = localStorage.getItem("token");
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(
          `Server response tidak valid: ${responseText.substring(0, 100)}...`,
        );
      }

      if (!response.ok) {
        console.error("Server error response:", result);
        const errorMessage =
          result.message ||
          result.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Enhanced error messages based on common validation issues
        if (response.status === 400) {
          if (result.details) {
            throw new Error(
              `Validasi gagal: ${JSON.stringify(result.details)}`,
            );
          } else if (result.errors) {
            throw new Error(`Validasi gagal: ${JSON.stringify(result.errors)}`);
          } else {
            throw new Error(`Data tidak valid: ${errorMessage}`);
          }
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      if (result.success) {
        console.log("Order created successfully:", result.data);
        setOrderId(result.data.id || result.data.orderId || "N/A");
        setOrderComplete(true);
        clearCart();
      } else {
        throw new Error(result.message || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack",
      );
      console.error("====================");

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError(
          "Tidak dapat terhubung ke server. Pastikan server backend berjalan.",
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membuat pesanan",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Test connection function
  const testConnection = async () => {
    try {
      setDebugInfo("Testing connection...");
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setDebugInfo("✅ Connection successful");
      } else {
        setDebugInfo(`❌ Connection failed: ${response.status}`);
      }
    } catch (error) {
      setDebugInfo(
        `❌ Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk melanjutkan checkout.
          </p>
          <div className="space-y-3">
            <a
              href="/login"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors block text-center"
            >
              Login Sekarang
            </a>
            <a
              href="/register"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
            >
              Daftar Akun Baru
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to home if cart is empty and not processing/complete
  if (cartItems.length === 0 && !isProcessing && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Keranjang Kosong
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan tambahkan produk ke keranjang terlebih dahulu sebelum
            checkout.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali Berbelanja
          </a>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pesanan Berhasil!
          </h2>
          <p className="text-gray-600 mb-6">
            Terima kasih telah berbelanja di AnimalMart. Pesanan Anda telah
            berhasil disimpan ke database.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
            <p className="text-sm text-green-700">
              Total:{" "}
              <span className="font-semibold">{formatPrice(finalTotal)}</span>
            </p>
          </div>
          <div className="space-y-3">
            <a
              href="/"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors block text-center"
            >
              Lanjut Berbelanja
            </a>
            <a
              href="/cart"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
            >
              Lihat Keranjang
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🐾</span>
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-green-600">Animal</span>
                <span className="text-yellow-600">Mart</span>
              </h1>
              <span className="text-gray-500">/ Checkout</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={testConnection}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Test Connection
              </button>
              <a
                href="/cart"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Keranjang
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-8 mt-6">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm font-mono">{debugInfo}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Informasi Pelanggan
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan email Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nomor telepon Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota *
                </label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan kota Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi *
                </label>
                <input
                  type="text"
                  value={customerInfo.province}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan provinsi Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  value={customerInfo.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan kode pos Anda"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap Anda (nama jalan, nomor rumah, RT/RW, dll)"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Metode Pembayaran
              </h2>
            </div>

            <div className="space-y-3">
              {/* E-Wallet */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  E-Wallet
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {paymentMethods
                    .filter((p) => p.type === "e_wallet")
                    .map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-medium text-gray-800">
                          {method.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Bank Transfer */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 mt-6">
                  Transfer Bank
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {paymentMethods
                    .filter((p) => p.type === "bank_transfer")
                    .map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-medium text-gray-800">
                          {method.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Cash on Delivery */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 mt-6">
                  Bayar Tunai
                </h3>
                {paymentMethods
                  .filter((p) => p.type === "cash")
                  .map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <span className="font-medium text-gray-800">
                        {method.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Ringkasan Pesanan
              </h2>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "../assets/image/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <p className="text-sm text-green-600 font-medium">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({getCartItemsCount()} item)
                </span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-medium">{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                <span>Total</span>
                <span className="text-green-600">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={
                isProcessing ||
                !selectedPayment ||
                !customerInfo.name ||
                !customerInfo.email ||
                !customerInfo.city ||
                !customerInfo.province ||
                !customerInfo.postalCode ||
                !customerInfo.address ||
                cartItems.length === 0
              }
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
                isProcessing ||
                !selectedPayment ||
                !customerInfo.name ||
                !customerInfo.email ||
                !customerInfo.city ||
                !customerInfo.province ||
                !customerInfo.postalCode ||
                !customerInfo.address ||
                cartItems.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses Pesanan...</span>
                </div>
              ) : (
                `Bayar Sekarang • ${formatPrice(finalTotal)}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Data akan disimpan ke Database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalMartCheckout;
