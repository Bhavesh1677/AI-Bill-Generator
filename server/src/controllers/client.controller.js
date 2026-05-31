import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Client } from "../models/client.model.js";

const createClient = asyncHandler(async (req, res) => {
  const { name, businessName, email, phone, address } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const client = await Client.create({
    name,
    businessName,
    email: email ? email.trim().toLowerCase() : undefined,
    phone,
    address,
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, client, "Client created successfully"));
});

const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, clients, "Clients fetched successfully"));
});

const getClientById = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  const client = await Client.findOne({ _id: clientId, userId: req.user._id });

  if (!client) {
    throw new ApiError(404, "Client not found or you are not authorized to view it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, client, "Client details fetched successfully"));
});

const updateClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;
  const { name, businessName, email, phone, address } = req.body;

  const client = await Client.findOne({ _id: clientId, userId: req.user._id });

  if (!client) {
    throw new ApiError(404, "Client not found or you are not authorized to update it");
  }

  if (name) client.name = name;
  if (businessName !== undefined) client.businessName = businessName;
  if (email !== undefined) client.email = email ? email.trim().toLowerCase() : undefined;
  if (phone !== undefined) client.phone = phone;
  if (address !== undefined) client.address = address;

  const updatedClient = await client.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedClient, "Client updated successfully"));
});

const deleteClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  const client = await Client.findOneAndDelete({ _id: clientId, userId: req.user._id });

  if (!client) {
    throw new ApiError(404, "Client not found or you are not authorized to delete it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Client deleted successfully"));
});

export {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
