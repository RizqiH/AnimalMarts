import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only with proper typing
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
});

// Error handling middleware for multer errors
export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof multer.MulterError) {
    let message = "Upload error occurred";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large (maximum 5MB allowed)";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files (maximum 5 files allowed)";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      case "LIMIT_PART_COUNT":
        message = "Too many parts";
        break;
      case "LIMIT_FIELD_KEY":
        message = "Field name too long";
        break;
      case "LIMIT_FIELD_VALUE":
        message = "Field value too long";
        break;
      case "LIMIT_FIELD_COUNT":
        message = "Too many fields";
        break;
    }

    const response: ApiResponse<null> = {
      success: false,
      message,
      error: error.message,
    };

    res.status(400).json(response);
    return;
  }

  if (error.message === "Only image files are allowed") {
    const response: ApiResponse<null> = {
      success: false,
      message: "Only image files are allowed",
      error: "Invalid file type",
    };

    res.status(400).json(response);
    return;
  }

  // For other errors, pass to next middleware
  next(error);
};
