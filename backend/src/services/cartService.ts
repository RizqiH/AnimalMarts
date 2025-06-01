import { db, COLLECTIONS } from "../config/firebase";
import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartRequest,
  RemoveFromCartRequest,
} from "../types/cart";
import { ProductService } from "./productService";
import { v4 as uuidv4 } from "uuid";

export class CartService {
  private collection = db.collection(COLLECTIONS.CARTS || "carts");
  private productService = new ProductService();

  async addToCart(request: AddToCartRequest): Promise<Cart> {
    const { userId, productId, quantity } = request;

    // Validate product exists
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Get or create cart for user
    let cart = await this.getCartByUserId(userId);

    if (!cart) {
      // Create new cart
      const cartId = uuidv4();
      const now = new Date();

      const newCartItem: CartItem = {
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        category: product.category,
      };

      const newCart: Omit<Cart, "id"> = {
        userId,
        items: [newCartItem],
        totalAmount: product.price * quantity,
        totalItems: quantity,
        createdAt: now,
        updatedAt: now,
      };

      await this.collection.doc(cartId).set(newCart);
      return { id: cartId, ...newCart };
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item to cart
        const newCartItem: CartItem = {
          id: uuidv4(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
          category: product.category,
        };
        cart.items.push(newCartItem);
      }

      // Recalculate totals
      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      cart.totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      cart.updatedAt = new Date();

      // Update in database
      await this.collection.doc(cart.id).update({
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        updatedAt: cart.updatedAt,
      });

      return cart;
    }
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Cart;
  }

  async updateCartItem(request: UpdateCartRequest): Promise<Cart | null> {
    const { userId, productId, quantity } = request;

    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate product exists
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Find and update item
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );
    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.updatedAt = new Date();

    // Update in database
    await this.collection.doc(cart.id).update({
      items: cart.items,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      updatedAt: cart.updatedAt,
    });

    return cart;
  }

  async removeFromCart(request: RemoveFromCartRequest): Promise<Cart | null> {
    const { userId, productId } = request;

    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Recalculate totals
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.updatedAt = new Date();

    // If cart is empty, delete it
    if (cart.items.length === 0) {
      await this.collection.doc(cart.id).delete();
      return null;
    }

    // Update in database
    await this.collection.doc(cart.id).update({
      items: cart.items,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      updatedAt: cart.updatedAt,
    });

    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    if (cart) {
      await this.collection.doc(cart.id).delete();
    }
  }

  async getCartStats(userId: string) {
    const cart = await this.getCartByUserId(userId);

    if (!cart) {
      return {
        totalItems: 0,
        totalAmount: 0,
        itemCount: 0,
      };
    }

    return {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length,
    };
  }
}
