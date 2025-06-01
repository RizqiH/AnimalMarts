// src/routes/uploadRoutes.ts
import { Router } from "express";
import { UploadController } from "../controllers/uploadController";
import {
  uploadMiddleware,
  handleUploadError,
} from "../middleware/uploadMiddleware";

const router = Router();
const uploadController = new UploadController();

// Upload single image
router.post(
  "/image",
  uploadMiddleware.single("image"),
  handleUploadError,
  uploadController.uploadImage,
);

// Upload multiple images
router.post(
  "/images",
  uploadMiddleware.array("images", 5),
  handleUploadError,
  uploadController.uploadImages,
);

// Delete image
router.delete("/image/:publicId", uploadController.deleteImage);

export default router;
