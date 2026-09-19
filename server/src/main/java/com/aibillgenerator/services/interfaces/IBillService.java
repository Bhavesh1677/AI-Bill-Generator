package com.aibillgenerator.services.interfaces;

import com.aibillgenerator.dto.request.CreateBillRequest;
import com.aibillgenerator.dto.response.BillDetailResponse;
import com.aibillgenerator.dto.response.DashboardStatsResponse;
import com.aibillgenerator.dto.response.ProfitLossReportResponse;
import com.aibillgenerator.models.Bill;
import com.aibillgenerator.models.User;
import java.util.List;

public interface IBillService {
    BillDetailResponse createBill(User user, CreateBillRequest request);
    List<Bill> getBills(User user);
    BillDetailResponse getBillById(User user, String billId);
    Bill updateBillStatus(User user, String billId, String status);
    void deleteBill(User user, String billId);
    DashboardStatsResponse getDashboardStats(User user);
    ProfitLossReportResponse getProfitLossReport(User user);
}
