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
      trackingInfo: {
        status: "pending",
        timeline: [{
          status: "pending",
          description: "Pesanan telah dibuat dan menunggu konfirmasi",
          timestamp: now,
        }],
      },
      canReview: false,
      createdAt: now,
      updatedAt: now,
    };

    // Add userId only if it exists
    if (orderData.userId) {
      order.userId = orderData.userId;
    }

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
    try {
      // Get all orders first
      const snapshot = await this.collection.get();

      if (snapshot.empty) {
        return {
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Get all orders and sort in memory
      let orders: Order[] = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    );

      // Sort by createdAt in memory
      orders = orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });

      // Apply pagination in memory
      const total = orders.length;
      const offset = (page - 1) * limit;
      const paginatedOrders = orders.slice(offset, offset + limit);

    return {
        orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    } catch (error) {
      console.error("Error getting all orders:", error);
      return {
        orders: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
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

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    try {
      // Simplified query without orderBy to avoid composite index requirement
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .get();

      if (snapshot.empty) {
        return {
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Get all orders and sort in memory
      let orders: Order[] = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    );

      // Sort by createdAt in memory
      orders = orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });

      // Apply pagination in memory
      const total = orders.length;
      const offset = (page - 1) * limit;
      const paginatedOrders = orders.slice(offset, offset + limit);

    return {
        orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    } catch (error) {
      console.error("Error getting user orders:", error);
      // Return empty result on error
      return {
        orders: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  async getUserOrder(userId: string, orderId: string): Promise<Order | null> {
    const doc = await this.collection.doc(orderId).get();
    if (!doc.exists) {
      return null;
    }

    const order = { id: doc.id, ...doc.data() } as Order;
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      return null;
    }

    return order;
  }

  async updateOrderStatusWithTracking(
    id: string,
    status: Order["status"],
    description?: string,
  ): Promise<Order | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const order = doc.data() as Order;
    const now = new Date();

    // Default descriptions for different statuses
    const defaultDescriptions = {
      pending: "Pesanan telah dibuat dan menunggu konfirmasi",
      confirmed: "Pesanan telah dikonfirmasi dan sedang diproses",
      processing: "Pesanan sedang diproses dan dikemas",
      shipped: "Pesanan telah dikirim dan dalam perjalanan",
      delivered: "Pesanan telah sampai di tujuan",
      cancelled: "Pesanan telah dibatalkan",
    };

    // Update tracking info
    const trackingInfo = {
      status,
      timeline: [
        ...(order.trackingInfo?.timeline || []),
        {
          status,
          description: description || defaultDescriptions[status],
          timestamp: now,
        },
      ],
    };

    // Check if order should be reviewable (when delivered)
    const canReview = status === "delivered";

    await docRef.update({
      status,
      trackingInfo,
      canReview,
      updatedAt: now,
    });

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
  }
}
