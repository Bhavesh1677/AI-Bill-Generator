package com.aibillgenerator.services.impl;

import com.aibillgenerator.dto.request.BillItemRequest;
import com.aibillgenerator.dto.request.CreateBillRequest;
import com.aibillgenerator.dto.response.BillDetailResponse;
import com.aibillgenerator.dto.response.DashboardStatsResponse;
import com.aibillgenerator.dto.response.ProfitLossReportResponse;
import com.aibillgenerator.exceptions.BadRequestException;
import com.aibillgenerator.exceptions.ResourceNotFoundException;
import com.aibillgenerator.models.*;
import com.aibillgenerator.repositories.BillItemRepository;
import com.aibillgenerator.repositories.BillRepository;
import com.aibillgenerator.repositories.ClientRepository;
import com.aibillgenerator.repositories.ProductRepository;
import com.aibillgenerator.services.interfaces.IBillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements IBillService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    public BillServiceImpl(
            BillRepository billRepository,
            BillItemRepository billItemRepository,
            ClientRepository clientRepository,
            ProductRepository productRepository
    ) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public BillDetailResponse createBill(User user, CreateBillRequest request) {
        if (request.getDueDate() == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Due date and at least one item are required");
        }

        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "Cash";

        Client client = null;
        if ("Store Credit".equalsIgnoreCase(paymentMethod)) {
            if (request.getClientId() == null || request.getClientId().isBlank()) {
                throw new BadRequestException("Customer profile is required for Store Credit (Khata) payment method");
            }
            client = clientRepository.findByIdAndUser(request.getClientId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found or unauthorized"));
        } else if (request.getClientId() != null && !request.getClientId().isBlank()) {
            client = clientRepository.findByIdAndUser(request.getClientId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found or unauthorized"));
        }

        // Generate Bill Number if not provided
        String finalBillNumber = request.getBillNumber();
        if (finalBillNumber == null || finalBillNumber.isBlank()) {
            long count = billRepository.countByUser(user);
            finalBillNumber = String.format("BILL-%04d", count + 1);
        }

        double total = 0.0;
        List<BillItem> billItemsToCreate = new ArrayList<>();

        for (BillItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Each item must have a valid productId and a positive quantity");
            }

            Product product = productRepository.findByIdAndUser(itemReq.getProductId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + itemReq.getProductId() + " not found or unauthorized"));

            String brandNameToUse = itemReq.getBrandName() != null ? itemReq.getBrandName() : (product.getBrandName() != null ? product.getBrandName() : "");
            Double sizeToUse = itemReq.getSize() != null ? itemReq.getSize() : (product.getSize() != null ? product.getSize() : 1.0);
            Double rateToUse = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getPrice();

            double subtotal = Math.round(itemReq.getQuantity() * rateToUse * 100.0) / 100.0;
            total += subtotal;

            // Deduct stock quantity
            double currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0.0;
            product.setStockQuantity(Math.max(0.0, currentStock - itemReq.getQuantity()));
            productRepository.save(product);

            BillItem billItem = new BillItem();
            billItem.setProduct(product);
            billItem.setQuantity(itemReq.getQuantity());
            billItem.setBillingUnit(itemReq.getBillingUnit() != null ? itemReq.getBillingUnit() : product.getUnit());
            billItem.setBillingQuantity(itemReq.getBillingQuantity() != null ? itemReq.getBillingQuantity() : itemReq.getQuantity());
            billItem.setBrandName(brandNameToUse);
            billItem.setSize(sizeToUse);
            billItem.setUnitPrice(rateToUse);
            billItem.setSubtotal(subtotal);

            billItemsToCreate.add(billItem);
        }

        total = Math.round(total * 100.0) / 100.0;

        // Determine starting status
        String finalStatus = request.getStatus();
        if (finalStatus == null || finalStatus.isBlank()) {
            finalStatus = "Store Credit".equalsIgnoreCase(paymentMethod) ? "unpaid" : "paid";
        }

        Bill bill = new Bill();
        bill.setBillNumber(finalBillNumber);
        bill.setUser(user);
        bill.setClient(client);
        bill.setCustomerName(request.getCustomerName() != null && !request.getCustomerName().isBlank()
                ? request.getCustomerName()
                : (client != null ? client.getName() : "Walk-in Customer"));
        bill.setCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : (client != null ? client.getPhone() : ""));
        bill.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDateTime.now());
        bill.setDueDate(request.getDueDate());
        bill.setStatus(finalStatus.toLowerCase());
        bill.setTotal(total);
        bill.setPaymentMethod(paymentMethod);

        Bill savedBill = billRepository.save(bill);

        // Update Store Credit in Khata ledger if applicable
        if ("Store Credit".equalsIgnoreCase(paymentMethod) && client != null) {
            double currentBalance = client.getOutstandingBalance() != null ? client.getOutstandingBalance() : 0.0;
            client.setOutstandingBalance(currentBalance + total);

            KhataHistoryEntry ledgerEntry = new KhataHistoryEntry();
            ledgerEntry.setClient(client);
            ledgerEntry.setType("purchase");
            ledgerEntry.setAmount(total);
            ledgerEntry.setBillId(savedBill.getId());
            ledgerEntry.setRemarks("Store credit purchase: Bill #" + finalBillNumber);
            ledgerEntry.setDate(LocalDateTime.now());

            client.getKhataHistory().add(ledgerEntry);
            clientRepository.save(client);
        }

        for (BillItem item : billItemsToCreate) {
            item.setBill(savedBill);
        }

        List<BillItem> createdItems = billItemRepository.saveAll(billItemsToCreate);

        return new BillDetailResponse(savedBill, createdItems);
    }

    @Override
    public List<Bill> getBills(User user) {
        return billRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public BillDetailResponse getBillById(User user, String billId) {
        Bill bill = billRepository.findByIdAndUser(billId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found or unauthorized"));

        List<BillItem> items = billItemRepository.findByBill(bill);
        return new BillDetailResponse(bill, items);
    }

    @Override
    @Transactional
    public Bill updateBillStatus(User user, String billId, String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required to update a bill status");
        }

        List<String> validStatuses = List.of("paid", "unpaid", "pending", "draft", "overdue");
        String normalizedStatus = status.trim().toLowerCase();
        if (!validStatuses.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid status. Allowed: paid, unpaid, pending, draft, overdue");
        }

        Bill bill = billRepository.findByIdAndUser(billId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found or unauthorized"));

        bill.setStatus(normalizedStatus);
        return billRepository.save(bill);
    }

    @Override
    @Transactional
    public void deleteBill(User user, String billId) {
        Bill bill = billRepository.findByIdAndUser(billId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found or unauthorized"));

        billItemRepository.deleteByBill(bill);
        billRepository.delete(bill);
    }

    @Override
    public DashboardStatsResponse getDashboardStats(User user) {
        List<Product> products = productRepository.findByUser(user);

        double unsoldStockValueCost = products.stream()
                .mapToDouble(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0.0) * (p.getCostPrice() != null ? p.getCostPrice() : 0.0))
                .sum();

        double unsoldStockValueSelling = products.stream()
                .mapToDouble(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0.0) * (p.getPrice() != null ? p.getPrice() : 0.0))
                .sum();

        List<Bill> bills = billRepository.findByUser(user);
        if (bills.isEmpty()) {
            return new DashboardStatsResponse(0.0, 0.0, round(unsoldStockValueCost), round(unsoldStockValueSelling));
        }

        List<BillItem> billItems = billItemRepository.findByBillIn(bills);

        Map<String, String> billStatusMap = bills.stream()
                .collect(Collectors.toMap(Bill::getId, Bill::getStatus, (s1, s2) -> s1));

        double totalProfit = 0.0;
        double realizedProfit = 0.0;

        for (BillItem item : billItems) {
            String billId = item.getBill() != null ? item.getBill().getId() : item.getBillId();
            String status = billStatusMap.getOrDefault(billId, "draft");
            if ("draft".equalsIgnoreCase(status)) continue;

            double cost = item.getProduct() != null && item.getProduct().getCostPrice() != null ? item.getProduct().getCostPrice() : 0.0;
            double unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
            double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;

            double itemProfit = (unitPrice - cost) * qty;
            totalProfit += itemProfit;

            if ("paid".equalsIgnoreCase(status)) {
                realizedProfit += itemProfit;
            }
        }

        return new DashboardStatsResponse(
                round(totalProfit),
                round(realizedProfit),
                round(unsoldStockValueCost),
                round(unsoldStockValueSelling)
        );
    }

    @Override
    public ProfitLossReportResponse getProfitLossReport(User user) {
        List<Bill> bills = billRepository.findByUserOrderByIssueDateDesc(user);
        if (bills.isEmpty()) {
            return new ProfitLossReportResponse(
                    new ProfitLossReportResponse.SummaryDto(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
        }

        List<BillItem> billItems = billItemRepository.findByBillIn(bills);

        Map<String, List<BillItem>> billItemsMap = new HashMap<>();
        for (BillItem item : billItems) {
            String bId = item.getBill() != null ? item.getBill().getId() : item.getBillId();
            billItemsMap.computeIfAbsent(bId, k -> new ArrayList<>()).add(item);
        }

        double totalRevenue = 0.0;
        double realizedRevenue = 0.0;
        double totalCOGS = 0.0;
        double realizedCOGS = 0.0;

        List<ProfitLossReportResponse.DetailedBillDto> detailedBills = new ArrayList<>();
        Map<String, ProfitLossReportResponse.DetailedProductDto> productStats = new HashMap<>();

        for (Bill bill : bills) {
            List<BillItem> items = billItemsMap.getOrDefault(bill.getId(), Collections.emptyList());
            double billCOGS = 0.0;

            for (BillItem item : items) {
                double cost = item.getProduct() != null && item.getProduct().getCostPrice() != null ? item.getProduct().getCostPrice() : 0.0;
                double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;
                double itemCOGS = cost * qty;
                billCOGS += itemCOGS;

                String pId = item.getProduct() != null ? item.getProduct().getId() : "deleted";
                ProfitLossReportResponse.DetailedProductDto pDto = productStats.computeIfAbsent(pId, k -> {
                    ProfitLossReportResponse.DetailedProductDto dto = new ProfitLossReportResponse.DetailedProductDto();
                    dto.setName(item.getProduct() != null ? item.getProduct().getName() : (item.getBrandName() != null ? item.getBrandName() + " Item" : "Unknown Product"));
                    dto.setBrandName(item.getBrandName() != null ? item.getBrandName() : (item.getProduct() != null ? item.getProduct().getBrandName() : ""));
                    dto.setCategory(item.getProduct() != null ? item.getProduct().getCategory() : "Other");
                    return dto;
                });

                pDto.setQuantitySold(pDto.getQuantitySold() + qty);
                pDto.setRevenue(pDto.getRevenue() + (item.getSubtotal() != null ? item.getSubtotal() : 0.0));
                pDto.setCogs(pDto.getCogs() + itemCOGS);
                pDto.setProfit(pDto.getProfit() + ((item.getSubtotal() != null ? item.getSubtotal() : 0.0) - itemCOGS));
            }

            double billRevenue = bill.getTotal() != null ? bill.getTotal() : 0.0;
            double billProfit = round(billRevenue - billCOGS);
            double billMargin = billRevenue > 0 ? round((billProfit / billRevenue) * 100.0) : 0.0;

            if (!"draft".equalsIgnoreCase(bill.getStatus())) {
                totalRevenue += billRevenue;
                totalCOGS += billCOGS;

                if ("paid".equalsIgnoreCase(bill.getStatus())) {
                    realizedRevenue += billRevenue;
                    realizedCOGS += billCOGS;
                }

                ProfitLossReportResponse.DetailedBillDto bDto = new ProfitLossReportResponse.DetailedBillDto();
                bDto.setId(bill.getId());
                bDto.setBillNumber(bill.getBillNumber());
                bDto.setCustomerName(bill.getCustomerName() != null ? bill.getCustomerName() : (bill.getClient() != null ? bill.getClient().getName() : "Walk-in Customer"));
                bDto.setIssueDate(bill.getIssueDate());
                bDto.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "Cash");
                bDto.setStatus(bill.getStatus());
                bDto.setRevenue(round(billRevenue));
                bDto.setCogs(round(billCOGS));
                bDto.setProfit(billProfit);
                bDto.setMargin(billMargin);

                detailedBills.add(bDto);
            }
        }

        double totalProfit = round(totalRevenue - totalCOGS);
        double realizedProfit = round(realizedRevenue - realizedCOGS);
        double totalMargin = totalRevenue > 0 ? round((totalProfit / totalRevenue) * 100.0) : 0.0;

        ProfitLossReportResponse.SummaryDto summary = new ProfitLossReportResponse.SummaryDto();
        summary.setTotalRevenue(round(totalRevenue));
        summary.setRealizedRevenue(round(realizedRevenue));
        summary.setTotalCOGS(round(totalCOGS));
        summary.setRealizedCOGS(round(realizedCOGS));
        summary.setTotalProfit(totalProfit);
        summary.setRealizedProfit(realizedProfit);
        summary.setTotalMargin(totalMargin);

        List<ProfitLossReportResponse.DetailedProductDto> detailedProducts = productStats.values().stream()
                .peek(p -> {
                    p.setRevenue(round(p.getRevenue()));
                    p.setCogs(round(p.getCogs()));
                    p.setProfit(round(p.getProfit()));
                    p.setMargin(p.getRevenue() > 0 ? round((p.getProfit() / p.getRevenue()) * 100.0) : 0.0);
                })
                .sorted((a, b) -> Double.compare(b.getProfit(), a.getProfit()))
                .collect(Collectors.toList());

        return new ProfitLossReportResponse(summary, detailedBills, detailedProducts);
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
