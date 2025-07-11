"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  getToken: () => string | null;
  getAuthHeaders: () => { [key: string]: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const API_BASE_URL = "https://backend-animalmart.vercel.app";

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client-side after hydration
    if (!isClient) return;
    
    // Check if user is logged in on app startup
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, [isClient]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user: userData } = data.data;
        if (isClient) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
        }
        setUser(userData);
        return { success: true, message: "Login berhasil!" };
      } else {
        return { success: false, message: data.message || "Login gagal" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Terjadi kesalahan saat login" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: "Registrasi berhasil! Silakan login." };
      } else {
        return { success: false, message: data.message || "Registrasi gagal" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Terjadi kesalahan saat registrasi" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setUser(null);
  };

  const getToken = (): string | null => {
    if (!isClient) return null;
    return localStorage.getItem("token");
  };

  const getAuthHeaders = (): { [key: string]: string } => {
    const token = getToken();
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        getToken,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 