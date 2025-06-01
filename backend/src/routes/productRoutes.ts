import { Router } from "express";
import { ProductController } from "../controllers/productController";

const router = Router();
const productController = new ProductController();

// Product routes - order matters for specificity
router.get("/categories", productController.getCategories);
router.get("/bestsellers", productController.getBestsellers);
router.get("/:id", productController.getProductById);
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
