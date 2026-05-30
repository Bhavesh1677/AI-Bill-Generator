import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bill } from "../models/bill.model.js";
import { BillItem } from "../models/billItem.model.js";
import { Client } from "../models/client.model.js";
import { Product } from "../models/product.model.js";

const createBill = asyncHandler(async (req, res) => {
  const { billNumber, clientId, issueDate, dueDate, status, items } = req.body;

  // 1. Validation
  if (!clientId || !dueDate || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Client, due date, and at least one item are required");
  }

  // Verify client belongs to user
  const client = await Client.findOne({ _id: clientId, userId: req.user._id });
  if (!client) {
    throw new ApiError(404, "Client not found or unauthorized");
  }

  // 2. Generate unique Bill Number if not provided
  let finalBillNumber = billNumber;
  if (!finalBillNumber) {
    const billCount = await Bill.countDocuments({ userId: req.user._id });
    finalBillNumber = `BILL-${(billCount + 1).toString().padStart(4, "0")}`;
  }

  // 3. Process line items
  let total = 0;
  const processedItems = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      throw new ApiError(400, "Each item must have a valid productId and a positive quantity");
    }

    const product = await Product.findOne({ _id: item.productId, userId: req.user._id });
    if (!product) {
      throw new ApiError(404, `Product with ID ${item.productId} not found or unauthorized`);
    }

    const subtotal = Number((product.price * item.quantity).toFixed(2));
    total += subtotal;

    processedItems.push({
      productId: product._id,
      quantity: Number(item.quantity),
      unitPrice: product.price,
      subtotal,
    });
  }

  total = Number(total.toFixed(2));

  // 4. Create the Bill
  const bill = await Bill.create({
    billNumber: finalBillNumber,
    userId: req.user._id,
    clientId: client._id,
    issueDate: issueDate || new Date(),
    dueDate,
    status: status || "pending",
    total,
  });

  // 5. Create the Bill Items related to the bill
  const itemsWithBillId = processedItems.map((item) => ({
    ...item,
    billId: bill._id,
  }));

  const createdItems = await BillItem.insertMany(itemsWithBillId);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        bill,
        items: createdItems,
      },
      "Bill and items created successfully"
    )
  );
});

const getBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({ userId: req.user._id })
    .populate("clientId", "name email phone address")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bills, "Bills fetched successfully"));
});

const getBillById = asyncHandler(async (req, res) => {
  const { billId } = req.params;

  const bill = await Bill.findOne({ _id: billId, userId: req.user._id })
    .populate("clientId", "name email phone address")
    .populate("userId", "name email");

  if (!bill) {
    throw new ApiError(404, "Bill not found or unauthorized");
  }

  const items = await BillItem.find({ billId: bill._id }).populate(
    "productId",
    "name description price unit"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bill,
        items,
      },
      "Bill details and items fetched successfully"
    )
  );
});

const updateBillStatus = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required to update a bill status");
  }

  const validStatuses = ["paid", "unpaid", "pending", "draft", "overdue"];
  if (!validStatuses.includes(status.toLowerCase())) {
    throw new ApiError(400, "Invalid status. Allowed: paid, unpaid, pending, draft, overdue");
  }

  const bill = await Bill.findOneAndUpdate(
    { _id: billId, userId: req.user._id },
    { $set: { status: status.toLowerCase() } },
    { new: true }
  ).populate("clientId", "name email");

  if (!bill) {
    throw new ApiError(404, "Bill not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill status updated successfully"));
});

const deleteBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;

  const bill = await Bill.findOne({ _id: billId, userId: req.user._id });

  if (!bill) {
    throw new ApiError(404, "Bill not found or unauthorized");
  }

  // Cascading delete: delete bill items first
  await BillItem.deleteMany({ billId: bill._id });

  // Delete the bill itself
  await Bill.findByIdAndDelete(bill._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Bill and its items deleted successfully"));
});

export {
  createBill,
  getBills,
  getBillById,
  updateBillStatus,
  deleteBill,
};
