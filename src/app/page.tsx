// HomePage.tsx
"use client";

import React, { useEffect } from "react";
import HeroSection from "./components/Herosection";
import CategoriesSection from "./components/CategorieSection";
import FeaturedProducts from "./components/FeaturedProduct";
import "./globals.css";

export default function HomePage() {
  useEffect(() => {
    // Handle scroll dari URL hash atau navigation
    const handleScrollToSection = () => {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1);
        const element = document.getElementById(sectionId);

        if (element) {
          const headerHeight = 80; // Sesuaikan dengan tinggi header Anda
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    };

    // Jalankan setelah component mount
    const timer = setTimeout(handleScrollToSection, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-amber-50">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
    </div>
  );
}
