import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, unit } = req.body;

  if (!name || price === undefined) {
    throw new ApiError(400, "Name and price are required");
  }

  if (price < 0) {
    throw new ApiError(400, "Price cannot be negative");
  }

  const product = await Product.create({
    name,
    description,
    price,
    unit: unit || "pcs",
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
  const { name, description, price, unit } = req.body;

  const product = await Product.findOne({ _id: productId, userId: req.user._id });

  if (!product) {
    throw new ApiError(404, "Product not found or you are not authorized to update it");
  }

  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) {
    if (price < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }
    product.price = price;
  }
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
