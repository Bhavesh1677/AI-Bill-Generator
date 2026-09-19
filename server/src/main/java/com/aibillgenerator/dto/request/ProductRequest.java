package com.aibillgenerator.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProductRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String brandName = "";

    private Double size = 1.0;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    @Min(value = 0, message = "Cost price cannot be negative")
    private Double costPrice = 0.0;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Double stockQuantity = 0.0;

    @Min(value = 0, message = "Minimum stock level cannot be negative")
    private Double minStockLevel = 10.0;

    private LocalDate expiryDate;
    private String category = "Other";
    private String unit = "pieces";

    public ProductRequest() {}

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

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(Double costPrice) {
        this.costPrice = costPrice;
    }

    public Double getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Double stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Double getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Double minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
