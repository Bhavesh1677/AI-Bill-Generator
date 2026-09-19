package com.aibillgenerator.controllers;

import com.aibillgenerator.dto.request.ProductRequest;
import com.aibillgenerator.dto.response.ApiResponse;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.security.CustomUserDetails;
import com.aibillgenerator.services.interfaces.IProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final IProductService productService;

    public ProductController(IProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProductRequest request
    ) {
        Product product = productService.createProduct(userDetails.getUser(), request);
        return new ResponseEntity<>(
                new ApiResponse<>(201, product, "Product created successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Product> products = productService.getProducts(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, products, "Products fetched successfully"));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<Product>> getProductById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId
    ) {
        Product product = productService.getProductById(userDetails.getUser(), productId);
        return ResponseEntity.ok(new ApiResponse<>(200, product, "Product details fetched successfully"));
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId,
            @RequestBody ProductRequest request
    ) {
        Product product = productService.updateProduct(userDetails.getUser(), productId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, product, "Product updated successfully"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId
    ) {
        productService.deleteProduct(userDetails.getUser(), productId);
        return ResponseEntity.ok(new ApiResponse<>(200, Collections.emptyMap(), "Product deleted successfully"));
    }
}
