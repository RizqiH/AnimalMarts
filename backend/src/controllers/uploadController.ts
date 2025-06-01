import { Request, Response } from "express";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import { ProductService } from "../services/productService";
import { ApiResponse } from "../types/common";

export class UploadController {
  private productService = new ProductService();

  uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        const response: ApiResponse<null> = {
          success: false,
          message: "No image file provided",
        };
        res.status(400).json(response);
        return;
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "pet-store/products",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      const uploadData = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };

      // If productId is provided, update the product image
      if (req.body.productId) {
        await this.productService.updateProductImage(
          req.body.productId,
          result.secure_url,
          result.public_id,
        );
      }

      const response: ApiResponse<typeof uploadData> = {
        success: true,
        data: uploadData,
        message: "Image uploaded successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to upload image",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  uploadImages = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          message: "No image files provided",
        };
        res.status(400).json(response);
        return;
      }

      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, {
          folder: "pet-store/products",
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          originalName: file.originalname,
        };
      });

      const results = await Promise.all(uploadPromises);

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results,
        message: `${results.length} images uploaded successfully`,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to upload images",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };

  deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        const response: ApiResponse<null> = {
          success: false,
          message: "Public ID is required",
        };
        res.status(400).json(response);
        return;
      }

      // Decode the public ID (it might be URL encoded)
      const decodedPublicId = decodeURIComponent(publicId);

      const result = await deleteFromCloudinary(decodedPublicId);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: "Image deleted successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Failed to delete image",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    }
  };
}
