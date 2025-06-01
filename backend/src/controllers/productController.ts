import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { ApiResponse } from "../types/common";

export class ProductController {
  private productService = new ProductService();

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.productService.getAllProducts(req.query as any);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: "Products retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve products",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: "Product retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve product",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: "Product created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to create product",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.updateProduct(id, req.body);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: "Product updated successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.productService.deleteProduct(id);

      if (!success) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Product not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Product deleted successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.productService.getCategories();

      const response: ApiResponse<string[]> = {
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve categories",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  getBestsellers = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const products = await this.productService.getBestsellers(limit);

      const response: ApiResponse<typeof products> = {
        success: true,
        data: products,
        message: "Bestsellers retrieved successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to retrieve bestsellers",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };
}
