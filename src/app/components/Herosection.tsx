import React from "react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-amber-50 to-amber-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Temukan Gaya <br />
              <span className="text-green-600">
                Hemat Waktu,Lengkapi kebutuhan
              </span>{" "}
              Terbaik
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Ekspresikan karakter fashion terbaik dari dengan koleksi unggulan
              kami berikan penampilan untuk pets dan mereka.
            </p>
            <div className="flex space-x-4">
              <Link href="/product">
                <button className="hover:cursor-pointer bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
                  Belanja Sekarang
                </button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className=" p-8">
              <img
                src="../assets/image/logo.png"
                alt="Animalmart"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
