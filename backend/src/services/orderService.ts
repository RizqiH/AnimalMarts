import { db, COLLECTIONS } from "../config/firebase";
import { Order, CreateOrderRequest, CartItem } from "../types/order";
import { v4 as uuidv4 } from "uuid";

export class OrderService {
  private collection = db.collection(COLLECTIONS.ORDERS);

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const id = uuidv4();
    const now = new Date();

    // Hitung total berdasarkan data yang dikirim dari frontend
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order: Omit<Order, "id"> = {
      items: orderData.items,
      customerInfo: orderData.customerInfo,
      paymentMethod: orderData.paymentMethod,
      totalAmount,
      status: "pending",
      notes: orderData.notes || "",
      createdAt: now,
      updatedAt: now,
    };

    // Create order in database
    await this.collection.doc(id).set(order);

    return { id, ...order };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Order;
  }

  async getAllOrders(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const snapshot = await this.collection
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const orders: Order[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    );

    // Get total count for pagination
    const totalSnapshot = await this.collection.get();
    const total = totalSnapshot.size;

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(
    id: string,
    status: Order["status"],
  ): Promise<Order | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    await docRef.update({
      status,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
  }

  async getOrdersByStatus(status: Order["status"]) {
    const snapshot = await this.collection
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    );
  }

  async getOrderStats() {
    const snapshot = await this.collection.get();
    const orders = snapshot.docs.map((doc) => doc.data() as Order);

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    return stats;
  }

  async cancelOrder(id: string): Promise<Order | null> {
    const order = await this.getOrderById(id);

    if (!order) {
      return null;
    }

    if (order.status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    // Tidak perlu restore stock karena tidak ada validasi stock
    return await this.updateOrderStatus(id, "cancelled");
  }
}
