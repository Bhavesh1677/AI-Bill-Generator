package com.aibillgenerator.dto.response;

public class DashboardStatsResponse {
    private Double totalProfit;
    private Double realizedProfit;
    private Double unsoldStockValueCost;
    private Double unsoldStockValueSelling;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(Double totalProfit, Double realizedProfit, Double unsoldStockValueCost, Double unsoldStockValueSelling) {
        this.totalProfit = totalProfit;
        this.realizedProfit = realizedProfit;
        this.unsoldStockValueCost = unsoldStockValueCost;
        this.unsoldStockValueSelling = unsoldStockValueSelling;
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

    public Double getUnsoldStockValueCost() {
        return unsoldStockValueCost;
    }

    public void setUnsoldStockValueCost(Double unsoldStockValueCost) {
        this.unsoldStockValueCost = unsoldStockValueCost;
    }

    public Double getUnsoldStockValueSelling() {
        return unsoldStockValueSelling;
    }

    public void setUnsoldStockValueSelling(Double unsoldStockValueSelling) {
        this.unsoldStockValueSelling = unsoldStockValueSelling;
    }
}
