import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Supplier } from "../models/supplier.model.js";
import { Product } from "../models/product.model.js";

const createSupplier = asyncHandler(async (req, res) => {
  const { name, contactPerson, phone, address } = req.body;

  if (!name) {
    throw new ApiError(400, "Supplier name is required");
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    phone,
    address,
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, supplier, "Supplier created successfully"));
});

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, suppliers, "Suppliers fetched successfully"));
});

const updateSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;
  const { name, contactPerson, phone, address } = req.body;

  const supplier = await Supplier.findOne({ _id: supplierId, userId: req.user._id });

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  if (name) supplier.name = name;
  if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
  if (phone !== undefined) supplier.phone = phone;
  if (address !== undefined) supplier.address = address;

  const updatedSupplier = await supplier.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSupplier, "Supplier updated successfully"));
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;

  const supplier = await Supplier.findOneAndDelete({ _id: supplierId, userId: req.user._id });

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Supplier deleted successfully"));
});

const restockProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, costPrice, expiryDate } = req.body;

  if (quantity === undefined || quantity <= 0) {
    throw new ApiError(400, "Restock quantity must be positive");
  }

  const product = await Product.findOne({ _id: productId, userId: req.user._id });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Increment stock level
  product.stockQuantity += Number(quantity);

  // Update costPrice if provided
  if (costPrice !== undefined && costPrice >= 0) {
    product.costPrice = Number(costPrice);
  }

  // Update expiry date if provided
  if (expiryDate !== undefined) {
    product.expiryDate = expiryDate ? new Date(expiryDate) : null;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product inventory restocked successfully"));
});

export {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  restockProduct,
};
