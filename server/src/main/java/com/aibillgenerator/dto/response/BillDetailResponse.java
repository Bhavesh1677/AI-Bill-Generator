package com.aibillgenerator.dto.response;

import com.aibillgenerator.models.Bill;
import com.aibillgenerator.models.BillItem;
import java.util.List;

public class BillDetailResponse {
    private Bill bill;
    private List<BillItem> items;

    public BillDetailResponse() {}

    public BillDetailResponse(Bill bill, List<BillItem> items) {
        this.bill = bill;
        this.items = items;
    }

    public Bill getBill() {
        return bill;
    }

    public void setBill(Bill bill) {
        this.bill = bill;
    }

    public List<BillItem> getItems() {
        return items;
    }

    public void setItems(List<BillItem> items) {
        this.items = items;
    }
}
