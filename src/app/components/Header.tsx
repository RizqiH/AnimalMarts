"use client";
import React, { useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      setTimeout(() => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

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

      setTimeout(() => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        setTimeout(() => observer.disconnect(), 3000);
      }, 100);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 mr-3 group-hover:scale-110 transition-transform duration-200">
              <img
                src="../assets/image/logo.jpg"
                alt="AnimalMart Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-green-600">Animal</span>
              <span className="text-orange-500">Mart</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-gray-700 hover:text-green-600 transition-colors relative group ${
                pathname === "/" ? "text-green-600 font-medium" : ""
              }`}
            >
              Beranda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <button
              onClick={handleProductClick}
              className="text-gray-700 hover:text-green-600 cursor-pointer transition-colors focus:outline-none relative group"
            >
              Produk
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={handleCategoryClick}
              className="text-gray-700 hover:text-green-600 cursor-pointer transition-colors focus:outline-none relative group"
            >
              Kategori
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <Link
              href="/pesanan"
              className={`text-gray-700 hover:text-green-600 transition-colors relative group ${
                pathname === "/pesanan" ? "text-green-600 font-medium" : ""
              }`}
            >
              Pesanan
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Right Side - Cart and Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative group">
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors">
                    {user?.name}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-gray-700 hover:text-green-600 transition-colors ${
                  pathname === "/" ? "text-green-600 font-medium" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <button
                onClick={() => {
                  handleProductClick();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-green-600 transition-colors"
              >
                Produk
              </button>
              <button
                onClick={() => {
                  handleCategoryClick();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-green-600 transition-colors"
              >
                Kategori
              </button>
              <Link
                href="/pesanan"
                className={`text-gray-700 hover:text-green-600 transition-colors ${
                  pathname === "/pesanan" ? "text-green-600 font-medium" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pesanan
              </Link>
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;