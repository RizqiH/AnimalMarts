"use client";
import React from "react";
import Link from "next/link";
import { 
  Heart,
  ShoppingBag,
  Star,
  Truck
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-green-500 mb-4">
                Animal<span className="text-orange-400">Mart</span>
              </h3>
              <p className="text-black leading-relaxed">
                Toko online terpercaya untuk semua kebutuhan hewan peliharaan Anda. 
                Kami menyediakan produk berkualitas tinggi dengan harga terjangkau.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">Menu Utama</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-black hover:text-green-500 transition-colors flex items-center"
                >
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/product" 
                  className="text-black hover:text-green-500 transition-colors flex items-center"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>Produk</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">Kategori Produk</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/product" 
                  className="text-black hover:text-green-500 transition-colors"
                >
                  Pakan
                </Link>
              </li>
              <li>
                <Link 
                  href="/product" 
                  className="text-black hover:text-green-500 transition-colors"
                >
                  Hewan Peliharaan
                </Link>
              </li>
              <li>
                <Link 
                  href="/product" 
                  className="text-black hover:text-green-500 transition-colors"
                >
                  Ikan
                </Link>
              </li>
              <li>
                <Link 
                  href="/product" 
                  className="text-black hover:text-green-500 transition-colors"
                >
                  Hewan Ternak
                </Link>
              </li>
            </ul>
            
            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-black">Gratis Ongkir</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-black">Kualitas Terjamin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">
                © 2025 AnimalMart. Dibuat di
                di Surabaya, Indonesia
              </span>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-500 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-green-500 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;