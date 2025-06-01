import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`,
  );
}

const serviceAccount: ServiceAccount = {
  projectId: requiredEnvVars.FIREBASE_PROJECT_ID!,
  privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL!,
};

// Validate required environment variables
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
if (!storageBucket) {
  throw new Error("FIREBASE_STORAGE_BUCKET environment variable is required");
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: requiredEnvVars.FIREBASE_STORAGE_BUCKET as string,
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Collection references
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  CATEGORIES: "categories",
  CARTS: "carts",
} as const;

export default app;
