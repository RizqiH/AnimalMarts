"use client";
import React, { useState, useEffect } from "react";
import { Star, ArrowLeft, ShoppingCart, Users, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  category: string;
  bestseller?: boolean;
  stock: number;
  buyers?: { name: string; date: string; review: string }[];
};

const FeaturedProducts = () => {
  const [currentView, setCurrentView] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { addToCart } = useCart();

  const API_BASE_URL = "https://backend-animalmart.vercel.app";

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchProducts();
    }
  }, [isClient]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/products`);

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);

        if (data.success && Array.isArray(data.data.products)) {
          const apiProducts = data.data.products.map((product: any, index: number) => ({
            ...product,
            id: product.id?.toString() || `product-${index}`, // Ensure ID is string
            rating: product.rating || 4.5,
            reviews: product.reviews || (15 + (index * 3)), // Consistent instead of random
            bestseller: index < 2, // First 2 products are bestsellers (consistent)
            stock: product.stock || (50 + (index * 10)), // Consistent stock calculation
            buyers: generateSampleBuyers(index), // Pass index for consistency
          }));
          
          // Get first 4 products for featured section
          const featuredProducts = apiProducts.slice(0, 4);
          setProducts(featuredProducts);
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Gagal memuat produk. Silakan coba lagi.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleBuyers = (productIndex: number) => {
    const sampleNames = ["Ahmad R.", "Siti M.", "Budi T.", "Rina P.", "Dian W.", "Eko H.", "Linda K.", "Maria S."];
    const sampleReviews = [
      "Produk sangat bagus dan berkualitas!",
      "Sesuai dengan deskripsi, recommended!",
      "Pelayanan cepat, produk memuaskan",
      "Kualitas terbaik untuk harga yang terjangkau",
      "Sangat puas dengan pembelian ini",
      "Akan beli lagi di lain waktu"
    ];
    
    // Use deterministic selection based on product index to ensure consistency
    return Array.from({ length: 3 }, (_, i) => ({
      name: sampleNames[(productIndex + i) % sampleNames.length],
      date: `${((productIndex + i) % 14) + 1} hari lalu`,
      review: sampleReviews[(productIndex + i) % sampleReviews.length]
    }));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView("product-detail");
  };

  const handleBackToProducts = () => {
    setCurrentView("products");
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Show loading placeholder during hydration
  if (!isClient) {
    return (
      <section id="ProductSection" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produk <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Unggulan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Produk paling laris dengan kualitas terbaik pilihan pelanggan
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section id="ProductSection" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
            </div>
            <p className="text-gray-600 text-lg">Memuat produk unggulan...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="ProductSection" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">Oops! Terjadi Kesalahan</p>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={fetchProducts}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Product detail view
  if (currentView === "product-detail" && selectedProduct) {
    return (
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToProducts}
            className="flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors group animate-fade-in"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Produk
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
            <div className="animate-slide-in-left">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl hover-lift">
                <img
                  src={selectedProduct.image || "/assets/image/placeholder.jpg"}
                  alt={selectedProduct.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/image/placeholder.jpg";
                  }}
                />
                {selectedProduct.bestseller && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                    Terlaris
                  </div>
                )}
              </div>
            </div>

            <div className="animate-slide-in-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({selectedProduct.reviews} ulasan)
                </span>
              </div>
              
              <div className="text-3xl font-bold text-green-600 mb-6">
                {formatPrice(selectedProduct.price)}
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Deskripsi Produk
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-4">
                  Stok: <span className="font-semibold text-green-600">{selectedProduct.stock} tersedia</span>
                </p>
                
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Tambah ke Keranjang</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          {selectedProduct.buyers && selectedProduct.buyers.length > 0 && (
            <div className="mt-16 animate-fade-in stagger-delay-3">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Users className="w-6 h-6 mr-3" />
                Ulasan Pembeli
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedProduct.buyers.map((buyer, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover-lift animate-scale-in">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">
                          {buyer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {buyer.name}
                        </div>
                        <div className="text-sm text-gray-500">{buyer.date}</div>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm italic">
                      "{buyer.review}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Main products view
  return (
    <section id="ProductSection" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-scale-in">
            Produk <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Unggulan</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-delay-2">
            Produk paling laris dengan kualitas terbaik pilihan pelanggan
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center mt-8 animate-scale-in stagger-delay-3">
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-24 h-24 mx-auto mb-4" />
            </div>
            <p className="text-gray-500 text-lg">
              Belum ada produk unggulan tersedia
            </p>
            <button
              onClick={fetchProducts}
              className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleProductClick(product)}
              >
                <div className="relative overflow-hidden">
                  {product.bestseller && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10 animate-pulse">
                      Terlaris
                    </div>
                  )}
                  <img
                    src={product.image || "/assets/image/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/image/placeholder.jpg";
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <span className="text-white font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Lihat Detail
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({product.reviews})
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 transition-colors transform hover:scale-110"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in stagger-delay-5">
          <Link href="/product" passHref>
            <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-glow cursor-pointer">
              Lihat Semua Produk
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;