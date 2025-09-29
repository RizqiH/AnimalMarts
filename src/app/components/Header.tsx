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
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);

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

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      setIsMobileMenuOpen(true);
      setIsMenuAnimating(true);
      // Trigger animation after component mounts
      setTimeout(() => {
        setIsMenuAnimating(false);
      }, 10);
    }
  };

  const closeMobileMenu = () => {
    setIsMenuAnimating(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuAnimating(false);
    }, 300);
  };

  return (
    <header className="shadow-sm sticky top-0 z-50 backdrop-blur-md bg-white/95">
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

            {/* Auth Section - Desktop Only */}
            <div className="hidden md:block">
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
                <div className="flex items-center space-x-3">
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
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={toggleMobileMenu}
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
          <div 
            className="fixed inset-0 z-50 md:hidden"
            onClick={closeMobileMenu}
          >
            {/* Backdrop */}
            <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${
              isMenuAnimating ? 'opacity-0' : 'opacity-50'
            }`}></div>
            
            {/* Sliding Menu - dari kanan ke kiri */}
            <div 
              className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${
                isMenuAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-2">
                    <img
                      src="../assets/image/logo.jpg"
                      alt="AnimalMart Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-bold">
                    <span className="text-green-600">Animal</span>
                    <span className="text-orange-500">Mart</span>
                  </h2>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col h-full bg-white">
                {/* Navigation Links */}
                <nav className="flex flex-col p-6 space-y-4 flex-1">
                  <Link
                    href="/"
                    className={`text-gray-700 hover:text-green-600 transition-colors py-2 ${
                      pathname === "/" ? "text-green-600 font-medium" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Beranda
                  </Link>
                  <button
                    onClick={() => {
                      handleProductClick();
                      closeMobileMenu();
                    }}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors py-2"
                  >
                    Produk
                  </button>
                  <button
                    onClick={() => {
                      handleCategoryClick();
                      closeMobileMenu();
                    }}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors py-2"
                  >
                    Kategori
                  </button>
                  <Link
                    href="/pesanan"
                    className={`text-gray-700 hover:text-green-600 transition-colors py-2 ${
                      pathname === "/pesanan" ? "text-green-600 font-medium" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Pesanan
                  </Link>
                </nav>

                {/* Auth Section */}
                <div className="mt-auto p-6 border-t border-gray-200 bg-gray-50">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="w-full block text-center px-4 py-3 text-gray-700 hover:text-green-600 font-medium transition-colors border border-gray-300 rounded-lg hover:border-green-300"
                        onClick={closeMobileMenu}
                      >
                        Masuk
                      </Link>
                      <Link
                        href="/register"
                        className="w-full block text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                        onClick={closeMobileMenu}
                      >
                        Daftar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;