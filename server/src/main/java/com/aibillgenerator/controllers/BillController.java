package com.aibillgenerator.controllers;

import com.aibillgenerator.dto.request.CreateBillRequest;
import com.aibillgenerator.dto.request.UpdateStatusRequest;
import com.aibillgenerator.dto.response.ApiResponse;
import com.aibillgenerator.dto.response.BillDetailResponse;
import com.aibillgenerator.dto.response.DashboardStatsResponse;
import com.aibillgenerator.dto.response.ProfitLossReportResponse;
import com.aibillgenerator.models.Bill;
import com.aibillgenerator.security.CustomUserDetails;
import com.aibillgenerator.services.interfaces.IBillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bills")
public class BillController {

    private final IBillService billService;

    public BillController(IBillService billService) {
        this.billService = billService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillDetailResponse>> createBill(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateBillRequest request
    ) {
        BillDetailResponse response = billService.createBill(userDetails.getUser(), request);
        return new ResponseEntity<>(
                new ApiResponse<>(201, response, "Bill and items created successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bill>>> getBills(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Bill> bills = billService.getBills(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, bills, "Bills fetched successfully"));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        DashboardStatsResponse stats = billService.getDashboardStats(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, stats, "Dashboard statistics retrieved successfully"));
    }

    @GetMapping("/profit-loss-report")
    public ResponseEntity<ApiResponse<ProfitLossReportResponse>> getProfitLossReport(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ProfitLossReportResponse report = billService.getProfitLossReport(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, report, "Profit and Loss report generated successfully"));
    }

    @GetMapping("/{billId}")
    public ResponseEntity<ApiResponse<BillDetailResponse>> getBillById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String billId
    ) {
        BillDetailResponse response = billService.getBillById(userDetails.getUser(), billId);
        return ResponseEntity.ok(new ApiResponse<>(200, response, "Bill details and items fetched successfully"));
    }

    @PatchMapping("/{billId}/status")
    public ResponseEntity<ApiResponse<Bill>> updateBillStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String billId,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        Bill bill = billService.updateBillStatus(userDetails.getUser(), billId, request.getStatus());
        return ResponseEntity.ok(new ApiResponse<>(200, bill, "Bill status updated successfully"));
    }

    @DeleteMapping("/{billId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteBill(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String billId
    ) {
        billService.deleteBill(userDetails.getUser(), billId);
        return ResponseEntity.ok(new ApiResponse<>(200, Collections.emptyMap(), "Bill and its items deleted successfully"));
    }
}
