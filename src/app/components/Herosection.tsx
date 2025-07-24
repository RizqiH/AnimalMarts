import React from "react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Temukan Hewan <br />
              <span className="gradient-text animate-pulse-slow">
                Peliharaan Terbaik untuk Anda 
              </span>{" "}
              di AnimalMart!
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed animate-fade-in stagger-delay-2">
              Cari hewan peliharaan yang cocok untuk keluarga Anda di AnimalMart! Kami menyediakan berbagai pilihan hewan peliharaan dengan kualitas terbaik, siap menemani hari-hari Anda. Dapatkan juga pakan dan perlengkapan hewan berkualitas untuk mendukung kesejahteraan hewan kesayangan Anda.
            </p>
            <div className="flex space-x-4 animate-scale-in stagger-delay-3">
              <Link href="/product">
                <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-glow">
                  Belanja Sekarang
                </button>
              </Link>
              <Link href="/product">
                <button className="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold border-2 border-amber-600 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Jelajahi Produk
                </button>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center animate-slide-in-right">
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse-slow"></div>
              <div className="absolute inset-4 rounded-full bg-white opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              
              <div className="relative p-8 hover-lift">
                <img
                  src="../assets/image/logo.png"
                  alt="Animalmart"
                  className="w-full h-96 object-cover  hover:shadow-3xl transition-all duration-500 animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-amber-400 rounded-full animate-bounce-gentle opacity-60"></div>
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-green-400 rounded-full animate-bounce-gentle opacity-60" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-orange-400 rounded-full animate-bounce-gentle opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default HeroSection;
