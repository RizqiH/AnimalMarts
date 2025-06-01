import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", error);

  // Multer errors
  if (error.message.includes("File too large")) {
    const response: ApiResponse<null> = {
      success: false,
      message: "File size too large. Maximum allowed size is 5MB",
      error: "FILE_SIZE_LIMIT_EXCEEDED",
    };
    res.status(413).json(response);
    return;
  }

  if (error.message.includes("Only image files are allowed")) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Invalid file type. Only image files are allowed",
      error: "INVALID_FILE_TYPE",
    };
    res.status(400).json(response);
    return;
  }

  // Firebase errors
  if (error.message.includes("Firebase")) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Database error occurred",
      error: "DATABASE_ERROR",
    };
    res.status(500).json(response);
    return;
  }

  // Cloudinary errors
  if (error.message.includes("Cloudinary")) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Image upload service error",
      error: "UPLOAD_SERVICE_ERROR",
    };
    res.status(500).json(response);
    return;
  }

  // Default error
  const response: ApiResponse<null> = {
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "INTERNAL_SERVER_ERROR",
  };

  res.status(500).json(response);
};
