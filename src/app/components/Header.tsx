"use client";
import React, { useState, useEffect } from "react";
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
      // Trigger animation after component mounts
      setTimeout(() => {
        setIsMenuAnimating(false);
      }, 50);
    }
  };

  const closeMobileMenu = () => {
    setIsMenuAnimating(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuAnimating(false);
    }, 500);
  };

  // Handle swipe gesture
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && isMobileMenuOpen) {
      closeMobileMenu();
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      window.history.pushState({ mobileMenu: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="shadow-sm sticky top-0 z-50 bg-white">
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              onClick={toggleMobileMenu}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 w-6 h-6 text-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 w-6 h-6 text-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
                  }`} 
                />
              </div>
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
            <div className={`fixed inset-0 bg-black/30 transition-all duration-500 ${
              isMenuAnimating ? 'opacity-0' : 'opacity-100'
            }`}></div>
            
            {/* Sliding Menu - Full Width Setengah Halaman */}
            <div 
              className={`fixed top-0 left-0 h-full w-1/2 min-w-[320px] max-w-[500px] bg-white shadow-2xl transform transition-all duration-500 ease-out ${
                isMenuAnimating ? '-translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'
              }`}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                willChange: 'transform, opacity'
              }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-4">
                    <img
                      src="../assets/image/logo.jpg"
                      alt="AnimalMart Logo"
                      className="w-full h-full object-contain rounded-full shadow-sm"
                    />
                  </div>
                  <h2 className="text-xl font-bold">
                    <span className="text-green-600">Animal</span>
                    <span className="text-orange-500">Mart</span>
                  </h2>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-3 rounded-full hover:bg-gray-200 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col h-full bg-white">
                {/* Navigation Links */}
                <nav className="flex flex-col p-6 space-y-3 flex-1">
                  <Link
                    href="/"
                    className={`flex items-center px-6 py-4 rounded-xl transition-all duration-300 ${
                      pathname === "/" 
                        ? "bg-green-100 text-green-700 font-semibold border-l-4 border-green-500 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
                    } ${
                      isMenuAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}
                    style={{
                      transitionDelay: isMenuAnimating ? '0ms' : '100ms'
                    }}
                    onClick={closeMobileMenu}
                  >
                    <span className="ml-4 text-lg">Beranda</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleProductClick();
                      closeMobileMenu();
                    }}
                    className={`flex items-center px-6 py-4 rounded-xl text-left text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-all duration-300 ${
                      isMenuAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}
                    style={{
                      transitionDelay: isMenuAnimating ? '0ms' : '150ms'
                    }}
                  >
                    <span className="ml-4 text-lg">Produk</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCategoryClick();
                      closeMobileMenu();
                    }}
                    className={`flex items-center px-6 py-4 rounded-xl text-left text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-all duration-300 ${
                      isMenuAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}
                    style={{
                      transitionDelay: isMenuAnimating ? '0ms' : '200ms'
                    }}
                  >
                    <span className="ml-4 text-lg">Kategori</span>
                  </button>
                  <Link
                    href="/pesanan"
                    className={`flex items-center px-6 py-4 rounded-xl transition-all duration-300 ${
                      pathname === "/pesanan" 
                        ? "bg-green-100 text-green-700 font-semibold border-l-4 border-green-500 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
                    } ${
                      isMenuAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}
                    style={{
                      transitionDelay: isMenuAnimating ? '0ms' : '250ms'
                    }}
                    onClick={closeMobileMenu}
                  >
                    <span className="ml-4 text-lg">Pesanan</span>
                  </Link>
                </nav>

                {/* Auth Section */}
                <div className={`mt-auto p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-green-50 transition-all duration-300 ${
                  isMenuAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                }`}
                style={{
                  transitionDelay: isMenuAnimating ? '0ms' : '300ms'
                }}>
                  {isAuthenticated ? (
                    <div className="space-y-5">
                      {/* User Info Card */}
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Logout Button - Lebih Prominent */}
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-base">Keluar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link
                        href="/login"
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-gray-700 hover:text-green-600 font-semibold transition-all duration-200 border border-gray-300 rounded-2xl hover:border-green-300 hover:bg-green-50 text-lg"
                        onClick={closeMobileMenu}
                      >
                        <span>Masuk</span>
                      </Link>
                      <Link
                        href="/register"
                        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105 text-lg"
                        onClick={closeMobileMenu}
                      >
                        <span>Daftar</span>
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