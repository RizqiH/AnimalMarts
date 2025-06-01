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
      name: "Hewan Anabul",
      image: "../assets/image/9.jpg",
      link: "/product",
    },
    {
      name: "Hewan Burung",
      image: "../assets/image/12.jpg",
      link: "/product",
    },
  ];

  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
    return (
      <a
        href={category.link}
        className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors duration-300">
            {category.name}
          </h3>
          <p className="text-gray-600 text-sm">
            Lihat koleksi {category.name.toLowerCase()}
          </p>
        </div>
      </a>
    );
  };

  return (
    <section
      id="CategorieSection"
      className="py-16 px-4 bg-gray-50 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Kategori Pilihan
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Temukan berbagai kategori produk berkualitas untuk kebutuhan hewan
            kesayangan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
