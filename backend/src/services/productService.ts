import { db, COLLECTIONS } from "../config/firebase";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product";
import { ProductQuery } from "../types/common";
import { v4 as uuidv4 } from "uuid";

export class ProductService {
  private collection = db.collection(COLLECTIONS.PRODUCTS);

  async getAllProducts(query: ProductQuery = {}) {
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
      minPrice,
      maxPrice,
      search,
      bestseller,
    } = query;

    let firestoreQuery = this.collection.where("isActive", "==", true);

    // Apply filters
    if (category) {
      firestoreQuery = firestoreQuery.where("category", "==", category);
    }

    if (bestseller !== undefined) {
      firestoreQuery = firestoreQuery.where("bestseller", "==", bestseller);
    }

    // Apply sorting
    firestoreQuery = firestoreQuery.orderBy(sortBy, sortOrder as any);

    // Get all matching documents first (for filtering and counting)
    const snapshot = await firestoreQuery.get();
    let products: Product[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    );

    // Apply client-side filters that Firestore doesn't support well
    if (minPrice !== undefined) {
      products = products.filter((p) => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower),
      );
    }

    // Apply pagination
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Product;
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const id = uuidv4();
    const now = new Date();

    // Create product object without any undefined values
    const product = {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      description: productData.description || "",
      stock: productData.stock || 0,
      bestseller: productData.bestseller || false,
      image: productData.image || "",
      rating: 0,
      reviews: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Only add imagePublicId if it exists and is not undefined/null
    const productToSave: any = { ...product };
    if (
      productData.imagePublicId !== undefined &&
      productData.imagePublicId !== null &&
      productData.imagePublicId !== ""
    ) {
      productToSave.imagePublicId = productData.imagePublicId;
    }

    console.log("Product data being saved to Firestore:", productToSave);

    await this.collection.doc(id).set(productToSave);
    return { id, ...productToSave };
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductRequest,
  ): Promise<Product | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
    };

    await docRef.update(updatedData);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return false;
    }

    // Soft delete - just mark as inactive
    await this.collection.doc(id).update({
      isActive: false,
      updatedAt: new Date(),
    });

    return true;
  }

  async updateProductImage(
    id: string,
    imageUrl: string,
    imagePublicId?: string,
  ): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return false;
    }

    await this.collection.doc(id).update({
      image: imageUrl,
      imagePublicId: imagePublicId,
      updatedAt: new Date(),
    });

    return true;
  }

  async getCategories(): Promise<string[]> {
    const snapshot = await this.collection.where("isActive", "==", true).get();

    const categories = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const product = doc.data() as Product;
      if (product.category) {
        categories.add(product.category);
      }
    });

    return Array.from(categories).sort();
  }

  async getBestsellers(limit: number = 6): Promise<Product[]> {
    const snapshot = await this.collection
      .where("isActive", "==", true)
      .where("bestseller", "==", true)
      .orderBy("reviews", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    );
  }

  async updateStock(id: string, quantity: number): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    const product = doc.data() as Product;
    const newStock = product.stock - quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    await docRef.update({
      stock: newStock,
      updatedAt: new Date(),
    });

    return true;
  }
}
