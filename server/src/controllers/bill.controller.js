import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bill } from "../models/bill.model.js";
import { BillItem } from "../models/billItem.model.js";
import { Client } from "../models/client.model.js";
import { Product } from "../models/product.model.js";

const parseSizeFactor = (sizeVal) => {
  if (sizeVal === undefined || sizeVal === null) return 1;
  const parsed = parseFloat(sizeVal);
  return isNaN(parsed) ? 1 : parsed;
};

const createBill = asyncHandler(async (req, res) => {
  const { billNumber, clientId, issueDate, dueDate, status, items, paymentMethod } = req.body;

  // 1. Validation
  if (!dueDate || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Due date and at least one item are required");
  }

  let client = null;
  if (paymentMethod === "Store Credit") {
    if (!clientId) {
      throw new ApiError(400, "Customer profile is required for Store Credit (Khata) payment method");
    }
    client = await Client.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      throw new ApiError(404, "Customer profile not found or unauthorized");
    }
  } else if (clientId) {
    client = await Client.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      throw new ApiError(404, "Customer profile not found or unauthorized");
    }
  }

  // 2. Generate unique Bill Number if not provided
  let finalBillNumber = billNumber;
  if (!finalBillNumber) {
    const billCount = await Bill.countDocuments({ userId: req.user._id });
    finalBillNumber = `BILL-${(billCount + 1).toString().padStart(4, "0")}`;
  }

  // 3. Process line items and update inventory stock
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

    const brandNameToUse = item.brandName !== undefined ? item.brandName : (product.brandName || "");
    const sizeToUse = item.size !== undefined ? item.size : (product.size || "1");
    const rateToUse = item.unitPrice !== undefined ? Number(item.unitPrice) : product.price;

    // Subtotal calculation: quantity * rate
    const subtotal = Number((Number(item.quantity) * rateToUse).toFixed(2));
    total += subtotal;

    // Deduct stock quantity
    product.stockQuantity = Math.max(0, product.stockQuantity - Number(item.quantity));
    await product.save();

    processedItems.push({
      productId: product._id,
      quantity: Number(item.quantity),
      billingUnit: item.billingUnit || product.unit,
      billingQuantity: Number(item.quantity),
      brandName: brandNameToUse,
      size: sizeToUse,
      unitPrice: rateToUse,
      subtotal,
    });
  }

  total = Number(total.toFixed(2));

  // Determine starting bill status based on paymentMethod
  let finalStatus = status;
  if (!finalStatus) {
    if (paymentMethod === "Store Credit") {
      finalStatus = "unpaid";
    } else {
      finalStatus = "paid";
    }
  }

  // 4. Create the Bill
  const bill = await Bill.create({
    billNumber: finalBillNumber,
    userId: req.user._id,
    clientId: client ? client._id : null,
    customerName: req.body.customerName || (client ? client.name : "Walk-in Customer"),
    customerPhone: req.body.customerPhone || (client ? client.phone : ""),
    issueDate: issueDate || new Date(),
    dueDate,
    status: finalStatus,
    total,
    paymentMethod: paymentMethod || "Cash",
  });

  // 5. Update Khata Outstanding Credit Ledger if applicable
  if (paymentMethod === "Store Credit") {
    client.outstandingBalance += total;
    client.khataHistory.push({
      type: "purchase",
      amount: total,
      billId: bill._id,
      remarks: `Store credit purchase: Bill #${finalBillNumber}`,
      date: new Date(),
    });
    await client.save();
  }

  // 6. Create the Bill Items related to the bill
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
    .populate("clientId", "name businessName email phone address")
    .populate("userId", "name email phone address businessName upiId businessLogo");

  if (!bill) {
    throw new ApiError(404, "Bill not found or unauthorized");
  }

  const items = await BillItem.find({ billId: bill._id }).populate(
    "productId",
    "name brandName quantity price unit"
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

const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Fetch all products of the user
  const products = await Product.find({ userId: req.user._id });

  // Unsold stock value at Cost Price
  const unsoldStockValueCost = products.reduce(
    (sum, p) => sum + ((p.stockQuantity || 0) * (p.costPrice || 0)),
    0
  );

  // Unsold stock value at Selling Price
  const unsoldStockValueSelling = products.reduce(
    (sum, p) => sum + ((p.stockQuantity || 0) * (p.price || 0)),
    0
  );

  // 2. Fetch all bills of the user
  const bills = await Bill.find({ userId: req.user._id });
  const billIds = bills.map((b) => b._id);

  // 3. Fetch all bill items for these bills and populate product info to get cost price
  const billItems = await BillItem.find({ billId: { $in: billIds } }).populate("productId");

  // Map bills by ID for quick lookup of status
  const billStatusMap = {};
  bills.forEach((b) => {
    billStatusMap[b._id.toString()] = b.status;
  });

  // Calculate profit
  // We compute profit on all "paid" bills, or on all bills that are not draft.
  let totalProfit = 0; // profit from all bills (paid + unpaid/pending/overdue, excluding draft)
  let realizedProfit = 0; // profit from paid bills only

  for (const item of billItems) {
    const status = billStatusMap[item.billId.toString()] || "draft";
    if (status === "draft") continue;

    // cost price of the product
    const cost = item.productId ? (item.productId.costPrice || 0) : 0;
    // profit = (selling price - cost price) * quantity
    const itemProfit = (item.unitPrice - cost) * item.quantity;

    totalProfit += itemProfit;
    if (status === "paid") {
      realizedProfit += itemProfit;
    }
  }

  // Round values
  totalProfit = Number(totalProfit.toFixed(2));
  realizedProfit = Number(realizedProfit.toFixed(2));
  const unsoldCost = Number(unsoldStockValueCost.toFixed(2));
  const unsoldSelling = Number(unsoldStockValueSelling.toFixed(2));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProfit,
        realizedProfit,
        unsoldStockValueCost: unsoldCost,
        unsoldStockValueSelling: unsoldSelling,
      },
      "Dashboard statistics retrieved successfully"
    )
  );
});

const getProfitLossReport = asyncHandler(async (req, res) => {
  // 1. Fetch all bills of the user
  const bills = await Bill.find({ userId: req.user._id })
    .populate("clientId", "name email phone")
    .sort({ issueDate: -1 });

  const billIds = bills.map((b) => b._id);

  // 2. Fetch all bill items and populate product info
  const billItems = await BillItem.find({ billId: { $in: billIds } }).populate("productId");

  // Map bill items to their bills
  const billItemsMap = {};
  billItems.forEach((item) => {
    const bId = item.billId.toString();
    if (!billItemsMap[bId]) {
      billItemsMap[bId] = [];
    }
    billItemsMap[bId].push(item);
  });

  // 3. Compute summaries and detail list
  let totalRevenue = 0;
  let realizedRevenue = 0;
  let totalCOGS = 0;
  let realizedCOGS = 0;

  const detailedBills = [];
  const productStats = {}; // productId -> stats

  bills.forEach((bill) => {
    const items = billItemsMap[bill._id.toString()] || [];
    let billCOGS = 0;

    items.forEach((item) => {
      const cost = item.productId ? (item.productId.costPrice || 0) : 0;
      const itemCOGS = cost * item.quantity;
      billCOGS += itemCOGS;

      // Track product performance
      const pId = item.productId ? item.productId._id.toString() : "deleted";
      if (!productStats[pId]) {
        productStats[pId] = {
          name: item.productId ? item.productId.name : (item.brandName ? `${item.brandName} Item` : "Unknown Product"),
          brandName: item.brandName || (item.productId ? item.productId.brandName : ""),
          category: item.productId ? item.productId.category : "Other",
          quantitySold: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
        };
      }
      productStats[pId].quantitySold += item.quantity;
      productStats[pId].revenue += item.subtotal;
      productStats[pId].cogs += itemCOGS;
      productStats[pId].profit += (item.subtotal - itemCOGS);
    });

    const billRevenue = bill.total;
    const billProfit = Number((billRevenue - billCOGS).toFixed(2));
    const billMargin = billRevenue > 0 ? Number(((billProfit / billRevenue) * 100).toFixed(2)) : 0;

    // We exclude "draft" bills from profit/loss computations
    if (bill.status !== "draft") {
      totalRevenue += billRevenue;
      totalCOGS += billCOGS;

      if (bill.status === "paid") {
        realizedRevenue += billRevenue;
        realizedCOGS += billCOGS;
      }

      detailedBills.push({
        _id: bill._id,
        billNumber: bill.billNumber,
        customerName: bill.customerName || (bill.clientId ? bill.clientId.name : "Walk-in Customer"),
        issueDate: bill.issueDate,
        paymentMethod: bill.paymentMethod || "Cash",
        status: bill.status,
        revenue: billRevenue,
        cogs: Number(billCOGS.toFixed(2)),
        profit: billProfit,
        margin: billMargin,
      });
    }
  });

  // Calculate overall metrics
  const totalProfit = Number((totalRevenue - totalCOGS).toFixed(2));
  const realizedProfit = Number((realizedRevenue - realizedCOGS).toFixed(2));
  const totalMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

  // Format product stats into sorted array
  const detailedProducts = Object.values(productStats)
    .map((p) => ({
      ...p,
      revenue: Number(p.revenue.toFixed(2)),
      cogs: Number(p.cogs.toFixed(2)),
      profit: Number(p.profit.toFixed(2)),
      margin: p.revenue > 0 ? Number(((p.profit / p.revenue) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.profit - a.profit); // Sort by profit

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          realizedRevenue: Number(realizedRevenue.toFixed(2)),
          totalCOGS: Number(totalCOGS.toFixed(2)),
          realizedCOGS: Number(realizedCOGS.toFixed(2)),
          totalProfit,
          realizedProfit,
          totalMargin,
        },
        bills: detailedBills,
        products: detailedProducts,
      },
      "Profit and Loss report generated successfully"
    )
  );
});

export {
  createBill,
  getBills,
  getBillById,
  updateBillStatus,
  deleteBill,
  getDashboardStats,
  getProfitLossReport,
};
