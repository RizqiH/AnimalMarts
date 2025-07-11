import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(50).required(),
  price: Joi.number().positive().required(),
  description: Joi.string().max(1000).optional(),
  stock: Joi.number().integer().min(0).required(),
  bestseller: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  category: Joi.string().min(2).max(50).optional(),
  price: Joi.number().positive().optional(),
  description: Joi.string().max(1000).optional(),
  stock: Joi.number().integer().min(0).optional(),
  bestseller: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export const cartItemSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  image: Joi.string().optional(),
});

export const customerInfoSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s]+$/)
    .min(10)
    .max(20)
    .required(),
  address: Joi.object({
    street: Joi.string().min(5).max(200).required(),
    city: Joi.string().min(2).max(50).required(),
    province: Joi.string().min(2).max(50).required(),
    postalCode: Joi.string().min(5).max(10).required(),
  }).required(),
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(cartItemSchema).min(1).required(),
  customerInfo: customerInfoSchema.required(),
  paymentMethod: Joi.string()
    .valid("bank_transfer", "credit_card", "e_wallet", "cod")
    .required(),
  notes: Joi.string().max(500).allow("").optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    )
    .required(),
});

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().max(50).optional(),
  sortBy: Joi.string()
    .valid("name", "price", "rating", "reviews", "createdAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  category: Joi.string().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  search: Joi.string().max(100).optional(),
  bestseller: Joi.boolean().optional(),
});

// Middleware for validation
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Query validation error",
        error: error.details[0].message,
      });
    }
    next();
  };
};
