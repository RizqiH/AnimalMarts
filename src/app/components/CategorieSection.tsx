import React from "react";

type Category = {
  name: string;
  image: string;
  link: string;
};

const CategoriesSection = () => {
  const categories: Category[] = [
    {
      name: "Pakan",
      image: "../assets/image/1.jpg",
      link: "/product",
    },
    {
      name: "Hewan Ternak",
      image: "../assets/image/8.jpg",
      link: "/product",
    },
    {
      name: "Hewan Peliharaan",
      image: "../assets/image/9.jpg",
      link: "/product",
    },
    {
      name: "Ikan",
      image: "../assets/image/111.jpg",
      link: "/product",
    },
  ];

  const CategoryCard: React.FC<{ category: Category; index: number }> = ({ category, index }) => {
    return (
      <a
        href={category.link}
        className={`group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fade-in stagger-delay-${index + 1} hover-lift`}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-500"></div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
            <span className="text-white font-semibold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              Jelajahi Sekarang
            </span>
          </div>
        </div>
        
        <div className="p-6 relative">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">
            {category.name}
          </h3>
          <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
            Lihat koleksi {category.name.toLowerCase()}
          </p>
          
          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
      </a>
    );
  };

  return (
    <section
      id="CategorieSection"
      className="py-20 px-4 bg-gradient-to-br from-gray-50 to-amber-50 scroll-mt-20 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-scale-in">
            Kategori <span className="gradient-text">Pilihan</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-delay-2">
            Temukan berbagai kategori produk berkualitas untuk kebutuhan hewan
            kesayangan Anda
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center mt-8 animate-scale-in stagger-delay-3">
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={index} category={category} index={index} />
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in stagger-delay-5">
          <a
            href="/product"
            className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-glow"
          >
            Lihat Semua Kategori
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
