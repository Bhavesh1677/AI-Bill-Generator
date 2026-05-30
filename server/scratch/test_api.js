import { setTimeout } from "timers/promises";

const BASE_URL = "http://localhost:8000/api/v1";
const timestamp = Date.now();
const testUser = {
  name: "Test Developer",
  email: `dev_${timestamp}@example.com`,
  password: "SecurePassword123!",
};

let accessToken = "";
let clientId = "";
let product1Id = "";
let product2Id = "";
let billId = "";

async function runTests() {
  console.log("=== STARTING BACKEND INTEGRATION TESTS ===\n");

  try {
    // 1. Register User
    console.log("1. Registering test user...");
    const regRes = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    console.log("Register response status:", regRes.status);
    console.log("Register response message:", regData.message);
    if (regRes.status !== 201) throw new Error("Registration failed");

    // 2. Login User
    console.log("\n2. Logging in test user...");
    const loginRes = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginRes.json();
    console.log("Login response status:", loginRes.status);
    console.log("Login response message:", loginData.message);
    if (loginRes.status !== 200) throw new Error("Login failed");

    accessToken = loginData.data.accessToken;
    console.log("Captured Access Token successfully!");

    const authHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };

    // 3. Create a Client
    console.log("\n3. Creating a test client...");
    const clientRes = await fetch(`${BASE_URL}/clients`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Acme Corporation",
        email: "billing@acme.com",
        phone: "+1-555-0199",
        address: "123 Industrial Way, Tech City",
      }),
    });
    const clientData = await clientRes.json();
    console.log("Client create status:", clientRes.status);
    console.log("Created client name:", clientData.data.name);
    clientId = clientData.data._id;

    // 4. Create Products
    console.log("\n4. Creating products...");
    const p1Res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Premium Software Subscription",
        description: "Monthly enterprise plan",
        price: 99.99,
        unit: "month",
      }),
    });
    const p1Data = await p1Res.json();
    product1Id = p1Data.data._id;
    console.log("Created Product 1:", p1Data.data.name, `- Price: $${p1Data.data.price}`);

    const p2Res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Hourly Consulting Services",
        description: "Senior Architect consultations",
        price: 150.00,
        unit: "hour",
      }),
    });
    const p2Data = await p2Res.json();
    product2Id = p2Data.data._id;
    console.log("Created Product 2:", p2Data.data.name, `- Price: $${p2Data.data.price}`);

    // 5. Create a Bill
    console.log("\n5. Creating a new Bill with line items...");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    const billRes = await fetch(`${BASE_URL}/bills`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        clientId: clientId,
        dueDate: dueDate.toISOString(),
        status: "pending",
        items: [
          { productId: product1Id, quantity: 2 }, // 2 * 99.99 = 199.98
          { productId: product2Id, quantity: 5 }, // 5 * 150.00 = 750.00
        ], // Total should be 199.98 + 750.00 = 949.98
      }),
    });
    const billData = await billRes.json();
    console.log("Bill create status:", billRes.status);
    if (billRes.status !== 201) {
      console.error("Bill creation failed:", billData);
      throw new Error("Bill creation failed");
    }
    console.log("Created Bill Number:", billData.data.bill, "\nWait, let's verify totals:");
    console.log("Bill ID:", billData.data.bill._id);
    console.log("Calculated Total in DB:", `$${billData.data.bill.total}`);
    console.log("Number of created line items:", billData.data.items.length);
    billId = billData.data.bill._id;

    // 6. Get all Bills
    console.log("\n6. Retrieving all bills...");
    const getBillsRes = await fetch(`${BASE_URL}/bills`, {
      method: "GET",
      headers: authHeaders,
    });
    const getBillsData = await getBillsRes.json();
    console.log("Fetched bills count:", getBillsData.data.length);
    console.log("First bill's populated client name:", getBillsData.data[0].clientId.name);

    // 7. Get Bill by ID (with populated items)
    console.log(`\n7. Retrieving details for Bill ID: ${billId}...`);
    const singleBillRes = await fetch(`${BASE_URL}/bills/${billId}`, {
      method: "GET",
      headers: authHeaders,
    });
    const singleBillData = await singleBillRes.json();
    console.log("Single Bill detailed fetch status:", singleBillRes.status);
    console.log("Populated User Email:", singleBillData.data.bill.userId.email);
    console.log("Populated Client Name:", singleBillData.data.bill.clientId.name);
    console.log("Line Items detail:");
    singleBillData.data.items.forEach((item, index) => {
      console.log(`  - Item ${index + 1}: ${item.productId.name} x ${item.quantity} [Unit Price: $${item.unitPrice}] -> Subtotal: $${item.subtotal}`);
    });

    // 8. Update Bill Status
    console.log(`\n8. Updating status of Bill to 'paid'...`);
    const statusRes = await fetch(`${BASE_URL}/bills/${billId}/status`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "paid" }),
    });
    const statusData = await statusRes.json();
    console.log("Update status response code:", statusRes.status);
    console.log("New Bill Status in DB:", statusData.data.status);

    console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===\n");
  } catch (error) {
    console.error("\n!!! TEST SUITE FAILED !!!");
    console.error(error);
    process.exit(1);
  }
}

runTests();
