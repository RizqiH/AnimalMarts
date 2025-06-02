"use client";
import React, { useState, useEffect } from "react";
import { Star, ArrowLeft, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  category: string;
  bestseller?: boolean;
  buyers: { name: string; date: string; review: string }[];
};

const FeaturedProducts = () => {
  const [currentView, setCurrentView] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = "https://backend-animalmart.vercel.app";

  // Default products untuk fallback jika API tidak tersedia
  const defaultProducts: Product[] = [
    {
      id: 1,
      name: "InTune Natural Bird Food",
      price: 185000,
      rating: 5,
      reviews: 24,
      image: "../assets/image/1.jpg",
      category: "Pakan",
      description:
        "Premium natural bird food specially formulated for conure and cockatiel birds. Made with natural colors, fruit flavors, and omega-3 enriched ingredients. Contains encapsulated digestive probiotics for optimal bird health.",
      bestseller: true,
      buyers: [
        {
          name: "Sarah M.",
          date: "2 hari lalu",
          review: "Burung saya sangat suka makanan ini!",
        },
        {
          name: "Ahmad R.",
          date: "1 minggu lalu",
          review: "Kualitas sangat baik, burung jadi lebih aktif",
        },
        {
          name: "Linda K.",
          date: "2 minggu lalu",
          review: "Harga sepadan dengan kualitas",
        },
      ],
    },
    {
      id: 2,
      name: "Fresh Organic Carrots",
      price: 35000,
      rating: 5,
      reviews: 18,
      image: "../assets/image/2.jpg",
      category: "Pakan",
      description:
        "Premium organic carrots, freshly harvested and rich in vitamins and minerals. Perfect for healthy cooking, juicing, or as nutritious snacks. No pesticides or harmful chemicals used.",
      buyers: [
        {
          name: "Maria S.",
          date: "1 hari lalu",
          review: "Wortel sangat segar dan manis",
        },
        {
          name: "Budi T.",
          date: "3 hari lalu",
          review: "Organik berkualitas tinggi",
        },
        {
          name: "Siti N.",
          date: "1 minggu lalu",
          review: "Cocok untuk jus dan masakan",
        },
      ],
    },
    {
      id: 3,
      name: "Whiskas Adult Cat Food",
      price: 125000,
      rating: 5,
      reviews: 31,
      image: "../assets/image/3.jpg",
      category: "Pakan",
      description:
        "Complete and balanced nutrition for adult cats aged 1+ years. Two flavors in one pack with tuna and salmon varieties. Enriched with vitamins and minerals for healthy growth and shiny coat.",
      buyers: [
        {
          name: "Rina P.",
          date: "1 hari lalu",
          review: "Kucing saya doyan banget!",
        },
        {
          name: "Dian W.",
          date: "4 hari lalu",
          review: "Bulu kucing jadi lebih berkilau",
        },
        {
          name: "Eko H.",
          date: "1 minggu lalu",
          review: "Harga terjangkau, kualitas bagus",
        },
      ],
    },
    {
      id: 4,
      name: "IRUKA Premium Dog Food",
      price: 285000,
      rating: 5,
      reviews: 19,
      image: "../assets/image/4.jpg",
      category: "Pakan",
      description:
        "Premium quality dog food with lamb meat as the main ingredient. Specially formulated for adult dogs with complete daily nutrition. Contains high-quality protein for muscle development and healthy digestion.",
      bestseller: true,
      buyers: [
        {
          name: "Agus M.",
          date: "2 hari lalu",
          review: "Anjing saya suka sekali dengan rasa lamb ini",
        },
        {
          name: "Fitri A.",
          date: "5 hari lalu",
          review: "Kualitas premium, worth it!",
        },
        {
          name: "Reza K.",
          date: "1 minggu lalu",
          review: "Pencernaan anjing jadi lebih baik",
        },
      ],
    },
  ];

  // Fetch products dari API saat component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);

      if (response.ok) {
        const data = await response.json();
        console.log("Full response from API:", data);

        if (Array.isArray(data.data.products)) {
          const apiProducts = data.data.products.map((product: any) => ({
            ...product,
            rating: product.rating || 4.5, 
            reviews: product.reviews || 10,
            buyers: generateDefaultBuyers(), 
          }));
          
          console.log("API Products with defaults:", apiProducts);
          
          const featuredProducts = apiProducts.slice(0, 4);

          setProducts(featuredProducts);
          console.log("Featured products loaded from API:", featuredProducts);
        } else {
          console.error("Data from API is not an array:", data.data.products);
          setProducts(defaultProducts);
        }
      } else {
        console.log("API not available, using default products");
        setProducts(defaultProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(defaultProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultBuyers = () => {
    const defaultBuyers = [
      {
        name: "Pembeli A.",
        date: "2 hari lalu",
        review: "Produk sangat bagus dan berkualitas!",
      },
      {
        name: "Pembeli B.",
        date: "1 minggu lalu",
        review: "Sesuai dengan deskripsi, recommended!",
      },
      {
        name: "Pembeli C.",
        date: "2 minggu lalu",
        review: "Pelayanan cepat, produk memuaskan",
      },
    ];
    return defaultBuyers;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView("product-detail");
  };

  const handleBackToProducts = () => {
    setCurrentView("products");
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <section id="ProductSection" className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk unggulan...</p>
          </div>
        </div>
      </section>
    );
  }

  if (currentView === "product-detail" && selectedProduct) {
    return (
      <section className="py-16 bg-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToProducts}
            className="flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Produk
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <img
                src={selectedProduct.image || "../assets/image/placeholder.jpg"}
                alt={selectedProduct.name}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "../assets/image/placeholder.jpg";
                }}
              />
            </div>

            <div>
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
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Deskripsi Produk
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Users className="w-6 h-6 mr-3" />
              Yang Sudah Membeli
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedProduct.buyers.map((buyer, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-amber-600 font-semibold">
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
        </div>
      </section>
    );
  }

  return (
    <section id="ProductSection" className="py-16 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Produk Unggulan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Produk paling laris dengan kualitas terbaik pilihan pelanggan terpusat
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Belum ada produk unggulan tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative">
                  {product.bestseller && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                      Terlaris
                    </div>
                  )}
                  <img
                    src={product.image || "../assets/image/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "../assets/image/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {product.reviews} reviews
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/product" passHref>
            <button className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition cursor-pointer">
              Lihat Semua Produk
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;