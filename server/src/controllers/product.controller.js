import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, brandName, price, costPrice, stockQuantity, minStockLevel, expiryDate, category, unit, size } = req.body;

  if (!name || price === undefined) {
    throw new ApiError(400, "Name and price are required");
  }

  if (price < 0) {
    throw new ApiError(400, "Price cannot be negative");
  }

  if (costPrice !== undefined && costPrice < 0) {
    throw new ApiError(400, "Cost price cannot be negative");
  }

  const product = await Product.create({
    name,
    brandName,
    size: size !== undefined ? Number(size) : 1,
    price,
    costPrice: costPrice !== undefined ? Number(costPrice) : 0,
    stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
    minStockLevel: minStockLevel !== undefined ? Number(minStockLevel) : 10,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    category: category || "Other",
    unit: unit || "pieces",
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOne({ _id: productId, userId: req.user._id });

  if (!product) {
    throw new ApiError(404, "Product not found or you are not authorized to view it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, brandName, price, costPrice, stockQuantity, minStockLevel, expiryDate, category, unit, size } = req.body;

  const product = await Product.findOne({ _id: productId, userId: req.user._id });

  if (!product) {
    throw new ApiError(404, "Product not found or you are not authorized to update it");
  }

  if (name) product.name = name;
  if (brandName !== undefined) product.brandName = brandName;
  if (size !== undefined) product.size = Number(size);
  if (price !== undefined) {
    if (price < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }
    product.price = price;
  }
  if (costPrice !== undefined) {
    if (costPrice < 0) {
      throw new ApiError(400, "Cost price cannot be negative");
    }
    product.costPrice = costPrice;
  }
  if (stockQuantity !== undefined) {
    if (stockQuantity < 0) {
      throw new ApiError(400, "Stock quantity cannot be negative");
    }
    product.stockQuantity = stockQuantity;
  }
  if (minStockLevel !== undefined) {
    if (minStockLevel < 0) {
      throw new ApiError(400, "Min stock level cannot be negative");
    }
    product.minStockLevel = minStockLevel;
  }
  if (expiryDate !== undefined) {
    product.expiryDate = expiryDate ? new Date(expiryDate) : null;
  }
  if (category) product.category = category;
  if (unit) product.unit = unit;

  const updatedProduct = await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOneAndDelete({ _id: productId, userId: req.user._id });

  if (!product) {
    throw new ApiError(404, "Product not found or you are not authorized to delete it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
