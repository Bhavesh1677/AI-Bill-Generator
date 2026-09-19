package com.aibillgenerator.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProfitLossReportResponse {

    private SummaryDto summary;
    private List<DetailedBillDto> bills = new ArrayList<>();
    private List<DetailedProductDto> products = new ArrayList<>();

    public ProfitLossReportResponse() {}

    public ProfitLossReportResponse(SummaryDto summary, List<DetailedBillDto> bills, List<DetailedProductDto> products) {
        this.summary = summary;
        this.bills = bills;
        this.products = products;
    }

    public SummaryDto getSummary() {
        return summary;
    }

    public void setSummary(SummaryDto summary) {
        this.summary = summary;
    }

    public List<DetailedBillDto> getBills() {
        return bills;
    }

    public void setBills(List<DetailedBillDto> bills) {
        this.bills = bills;
    }

    public List<DetailedProductDto> getProducts() {
        return products;
    }

    public void setProducts(List<DetailedProductDto> products) {
        this.products = products;
    }

    public static class SummaryDto {
        private Double totalRevenue = 0.0;
        private Double realizedRevenue = 0.0;
        private Double totalCOGS = 0.0;
        private Double realizedCOGS = 0.0;
        private Double totalProfit = 0.0;
        private Double realizedProfit = 0.0;
        private Double totalMargin = 0.0;

        public SummaryDto() {}

        public Double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(Double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public Double getRealizedRevenue() {
            return realizedRevenue;
        }

        public void setRealizedRevenue(Double realizedRevenue) {
            this.realizedRevenue = realizedRevenue;
        }

        public Double getTotalCOGS() {
            return totalCOGS;
        }

        public void setTotalCOGS(Double totalCOGS) {
            this.totalCOGS = totalCOGS;
        }

        public Double getRealizedCOGS() {
            return realizedCOGS;
        }

        public void setRealizedCOGS(Double realizedCOGS) {
            this.realizedCOGS = realizedCOGS;
        }

        public Double getTotalProfit() {
            return totalProfit;
        }

        public void setTotalProfit(Double totalProfit) {
            this.totalProfit = totalProfit;
        }

        public Double getRealizedProfit() {
            return realizedProfit;
        }

        public void setRealizedProfit(Double realizedProfit) {
            this.realizedProfit = realizedProfit;
        }

        public Double getTotalMargin() {
            return totalMargin;
        }

        public void setTotalMargin(Double totalMargin) {
            this.totalMargin = totalMargin;
        }
    }

    public static class DetailedBillDto {
        @JsonProperty("_id")
        private String id;
        private String billNumber;
        private String customerName;
        private LocalDateTime issueDate;
        private String paymentMethod;
        private String status;
        private Double revenue;
        private Double cogs;
        private Double profit;
        private Double margin;

        public DetailedBillDto() {}

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getBillNumber() {
            return billNumber;
        }

        public void setBillNumber(String billNumber) {
            this.billNumber = billNumber;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public LocalDateTime getIssueDate() {
            return issueDate;
        }

        public void setIssueDate(LocalDateTime issueDate) {
            this.issueDate = issueDate;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Double getRevenue() {
            return revenue;
        }

        public void setRevenue(Double revenue) {
            this.revenue = revenue;
        }

        public Double getCogs() {
            return cogs;
        }

        public void setCogs(Double cogs) {
            this.cogs = cogs;
        }

        public Double getProfit() {
            return profit;
        }

        public void setProfit(Double profit) {
            this.profit = profit;
        }

        public Double getMargin() {
            return margin;
        }

        public void setMargin(Double margin) {
            this.margin = margin;
        }
    }

    public static class DetailedProductDto {
        private String name;
        private String brandName;
        private String category;
        private Double quantitySold = 0.0;
        private Double revenue = 0.0;
        private Double cogs = 0.0;
        private Double profit = 0.0;
        private Double margin = 0.0;

        public DetailedProductDto() {}

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBrandName() {
            return brandName;
        }

        public void setBrandName(String brandName) {
            this.brandName = brandName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Double getQuantitySold() {
            return quantitySold;
        }

        public void setQuantitySold(Double quantitySold) {
            this.quantitySold = quantitySold;
        }

        public Double getRevenue() {
            return revenue;
        }

        public void setRevenue(Double revenue) {
            this.revenue = revenue;
        }

        public Double getCogs() {
            return cogs;
        }

        public void setCogs(Double cogs) {
            this.cogs = cogs;
        }

        public Double getProfit() {
            return profit;
        }

        public void setProfit(Double profit) {
            this.profit = profit;
        }

        public Double getMargin() {
            return margin;
        }

        public void setMargin(Double margin) {
            this.margin = margin;
        }
    }
}
