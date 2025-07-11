import { FirebaseService } from "./firebaseService";
import { 
  User, 
  CreateUserRequest, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  AuthUser 
} from "../types/user";
import { ApiResponse } from "../types/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export class AuthService {
  private firebaseService = new FirebaseService();
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly JWT_EXPIRES_IN = "7d";

  async register(data: RegisterRequest): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user data
      const userData: User = {
        id: uuidv4(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: 'customer', // Default role
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firebase
      await this.firebaseService.db
        .collection("users")
        .doc(userData.id)
        .set(userData);

      // Return user without password
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error registering user:", error);
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // Get user by email
      const user = await this.getUserByEmail(data.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Return user without password and token
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error("Error logging in:", error);
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const doc = await this.firebaseService.db
        .collection("users")
        .doc(userId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as User;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const querySnapshot = await this.firebaseService.db
        .collection("users")
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as User;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async createUser(data: CreateUserRequest): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user data
      const userData: User = {
        id: uuidv4(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role || 'customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firebase
      await this.firebaseService.db
        .collection("users")
        .doc(userData.id)
        .set(userData);

      // Return user without password
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(error instanceof Error ? error.message : "User creation failed");
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<Omit<User, 'password'> | null> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      // Remove password from updates if present and hash it
      if (updates.password) {
        updateData.password = await bcrypt.hash(updates.password, 12);
      }

      await this.firebaseService.db
        .collection("users")
        .doc(userId)
        .update(updateData);

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        return null;
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("User update failed");
    }
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(user, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }

  async validateUser(userId: string): Promise<AuthUser | null> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      console.error("Error validating user:", error);
      return null;
    }
  }
} 