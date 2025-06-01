"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      return true;
    }
    return false;
  };

  const handleCategoryClick = () => {
    if (pathname === "/") {
      scrollToSection("CategorieSection");
    } else {
      router.push("/");

      const observer = new MutationObserver((mutations, obs) => {
        if (scrollToSection("CategorieSection")) {
          obs.disconnect(); 
        }
      });

      // Start observing setelah delay
      setTimeout(() => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Fallback: disconnect observer setelah 3 detik
        setTimeout(() => observer.disconnect(), 3000);
      }, 100);
    }
  };

  const handleProductClick = () => {
    if (pathname === "/") {
      scrollToSection("ProductSection");
    } else {
      router.push("/");

      const observer = new MutationObserver((mutations, obs) => {
        if (scrollToSection("ProductSection")) {
          obs.disconnect(); 
        }
      });

      // Start observing setelah delay
      setTimeout(() => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Fallback: disconnect observer setelah 3 detik
        setTimeout(() => observer.disconnect(), 3000);
      }, 100);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <img
                src="../assets/image/logo.jpg"
                alt="Image"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-green-600">Animal</span>
              <span className="text-orange-500">Mart</span>
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-gray-700 hover:text-green-600 transition-colors ${
                pathname === "/" ? "text-green-600 font-medium" : ""
              }`}
            >
              Beranda
            </Link>
            <button
              onClick={handleProductClick}
              className="text-gray-700 hover:text-green-600 cursor-pointer transition-colors focus:outline-none"
            >
              Produk
            </button>
            <button
              onClick={handleCategoryClick}
              className="text-gray-700 hover:text-green-600 cursor-pointer transition-colors focus:outline-none"
            >
              Kategori
            </button>
            <Link
              href="/pesanan"
              className={`text-gray-700 hover:text-green-600 transition-colors ${
                pathname === "/pesanan" ? "text-green-600 font-medium" : ""
              }`}
            >
              Pesanan
            </Link>
          </nav>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-green-600 cursor-pointer transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;