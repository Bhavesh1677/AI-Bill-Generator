package com.aibillgenerator.controllers;

import com.aibillgenerator.dto.request.RestockRequest;
import com.aibillgenerator.dto.request.SupplierRequest;
import com.aibillgenerator.dto.response.ApiResponse;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.Supplier;
import com.aibillgenerator.security.CustomUserDetails;
import com.aibillgenerator.services.interfaces.ISupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierController {

    private final ISupplierService supplierService;

    public SupplierController(ISupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SupplierRequest request
    ) {
        Supplier supplier = supplierService.createSupplier(userDetails.getUser(), request);
        return new ResponseEntity<>(
                new ApiResponse<>(201, supplier, "Supplier created successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliers(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Supplier> suppliers = supplierService.getSuppliers(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, suppliers, "Suppliers fetched successfully"));
    }

    @PatchMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String supplierId,
            @RequestBody SupplierRequest request
    ) {
        Supplier supplier = supplierService.updateSupplier(userDetails.getUser(), supplierId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, supplier, "Supplier updated successfully"));
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteSupplier(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String supplierId
    ) {
        supplierService.deleteSupplier(userDetails.getUser(), supplierId);
        return ResponseEntity.ok(new ApiResponse<>(200, Collections.emptyMap(), "Supplier deleted successfully"));
    }

    @PostMapping("/restock/{productId}")
    public ResponseEntity<ApiResponse<Product>> restockProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId,
            @Valid @RequestBody RestockRequest request
    ) {
        Product product = supplierService.restockProduct(userDetails.getUser(), productId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, product, "Product inventory restocked successfully"));
    }
}
