"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Star, Plus, X, Upload } from "lucide-react";
import { useCart } from "../context/CartContext";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  bestseller?: boolean;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  stock: string;
  image: string;
  bestseller: boolean;
}

const Product = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [favorites, setFavorites] = useState(new Set<number>());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Use cart context
  const { addToCart } = useCart();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    price: "",
    description: "",
    stock: "0",
    image: "",
    bestseller: false,
  });

  const categories = ["Anabul Animals", "Bird Animals", "Livestock", "Pakan"];
  const API_BASE_URL = "http://localhost:5000";

  // Default products untuk fallback jika API tidak tersedia
  const defaultProducts: Product[] = [
    {
      id: 1,
      name: "Persian Cat",
      category: "Anabul Animals",
      price: 2500000,
      rating: 4.8,
      reviews: 124,
      image: "../assets/image/9.jpg",
      bestseller: true,
    },
    {
      id: 2,
      name: "Golden Retriever Puppy",
      category: "Anabul Animals",
      price: 3500000,
      rating: 4.9,
      reviews: 89,
      image: "../assets/image/11.jpg",
    },
    {
      id: 3,
      name: "British Shorthair",
      category: "Anabul Animals",
      price: 2800000,
      rating: 4.7,
      reviews: 156,
      image: "../assets/image/10.jpg",
    },
    {
      id: 4,
      name: "Canary Bird Yellow",
      category: "Bird Animals",
      price: 250000,
      rating: 4.6,
      reviews: 78,
      image: "../assets/image/12.jpg",
      bestseller: true,
    },
    {
      id: 5,
      name: "Lovebird Lutino",
      category: "Bird Animals",
      price: 350000,
      rating: 4.5,
      reviews: 92,
      image: "../assets/image/13.jpg",
    },
    {
      id: 6,
      name: "Cockatiel Grey",
      category: "Bird Animals",
      price: 450000,
      rating: 4.7,
      reviews: 67,
      image: "../assets/image/14.jpg",
    },
    {
      id: 7,
      name: "Sapi",
      category: "Livestock",
      price: 15000000,
      rating: 4.8,
      reviews: 23,
      image: "../assets/image/8.jpg",
    },
    {
      id: 8,
      name: "Sapi 8 kg",
      category: "Livestock",
      price: 3500000,
      rating: 4.6,
      reviews: 34,
      image: "../assets/image/7.jpg",
    },
    {
      id: 9,
      name: "Intune",
      category: "Pakan",
      price: 2500000,
      rating: 4.7,
      reviews: 45,
      image: "../assets/image/1.jpg",
    },
    {
      id: 10,
      name: "Wortel",
      category: "Pakan",
      price: 350000,
      rating: 4.8,
      reviews: 234,
      image: "../assets/image/2.jpg",
      bestseller: true,
    },
    {
      id: 11,
      name: "Whiskas",
      category: "Pakan",
      price: 125000,
      rating: 4.5,
      reviews: 156,
      image: "../assets/image/3.jpg",
    },
    {
      id: 12,
      name: "Dog Food",
      category: "Pakan",
      price: 275000,
      rating: 4.6,
      reviews: 89,
      image: "../assets/image/4.jpg",
    },
    {
      id: 13,
      name: "Topsong Pellets 10kg",
      category: "Pakan",
      price: 425000,
      rating: 4.9,
      reviews: 198,
      image: "../assets/image/5.jpg",
    },
    {
      id: 14,
      name: "Dedek",
      category: "Pakan",
      price: 185000,
      rating: 4.4,
      reviews: 112,
      image: "../assets/image/6.jpg",
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

        // Pastikan untuk mengakses products dari data
        if (Array.isArray(data.data.products)) {
          setProducts(data.data.products);
          console.log("Products loaded from API:", data.data.products);
        } else {
          console.error("Data from API is not an array:", data.data.products);
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

  // Updated addToCart function to use context instead of API
  const handleAddToCart = async (product: Product): Promise<void> => {
    try {
      // Use the cart context to add product
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });

      alert("Produk berhasil ditambahkan ke keranjang!");

      // Optional: Still try to sync with API if available
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "current-user-id",
            productId: product.id.toString(),
            quantity: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Synced with API:", data);
        }
      } catch (apiError) {
        console.log("API sync failed, but cart updated locally:", apiError);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Terjadi error saat menambahkan ke keranjang");
    }
  };

  const toggleFavorite = (productId: number): void => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.category || !formData.price) {
        alert("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      const price = parseInt(formData.price);
      if (isNaN(price) || price < 0) {
        alert("Harga harus berupa angka yang valid");
        return;
      }

      // Create submit data without undefined values
      const submitData: any = {
        name: formData.name.trim(),
        category: formData.category,
        price: price,
        description: formData.description || "",
        stock: parseInt(formData.stock) || 0,
        bestseller: formData.bestseller,
        image: formData.image || "",
      };

      console.log("Submitting data:", submitData);

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP Error: ${response.status} ${response.statusText}`,
        }));

        console.error("API Error Response:", errorData);
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      handleSuccessfulSubmit();
    } catch (error) {
      console.error("Submit error:", error);
      alert(`Gagal menambahkan produk: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessfulSubmit = () => {
    // Memuat ulang produk setelah produk baru ditambahkan
    fetchProducts();

    // Reset form
    setFormData({
      name: "",
      category: "",
      price: "",
      description: "",
      stock: "0",
      image: "",
      bestseller: false,
    });

    setIsModalOpen(false);
    alert("Produk berhasil ditambahkan!");
  };

  const filteredProducts: Product[] = products.filter(
    (product) =>
      selectedCategory === "" || product.category === selectedCategory,
  );

  const sortedProducts: Product[] = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "harga-rendah":
        return a.price - b.price;
      case "harga-tinggi":
        return b.price - a.price;
      case "popularitas":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const formatPrice = (price: number | undefined | null) => {
    if (!price || price === 0) return "Rp 0";
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Semua Produk ({products.length})
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kategori
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ""}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">Semua</span>
                </label>
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Urutkan
              </h3>
              <div className="space-y-3">
                {[
                  { value: "terbaru", label: "Terbaru" },
                  { value: "harga-rendah", label: "Harga: Rendah ke Tinggi" },
                  { value: "harga-tinggi", label: "Harga: Tinggi ke Rendah" },
                  { value: "popularitas", label: "Popularitas" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Tidak ada produk ditemukan
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      {product.bestseller && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                          Terlaris
                        </div>
                      )}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="hover:cursor-pointer absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
                      >
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                      </button>
                      <div className="h-48 flex items-center justify-center">
                        <img
                          src={product.image || "../assets/image/logo.jpg"}
                          alt={product.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src =
                              "../assets/image/placeholder.jpg";
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3">
                        {product.category}
                      </p>

                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Tambah Produk Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Produk
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                          >
                            <span>Upload gambar</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="bestseller"
                  id="bestseller"
                  checked={formData.bestseller}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="bestseller"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Tandai sebagai produk terlaris
                </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menambahkan..." : "Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
