package com.aibillgenerator.services.impl;

import com.aibillgenerator.dto.request.RestockRequest;
import com.aibillgenerator.dto.request.SupplierRequest;
import com.aibillgenerator.exceptions.BadRequestException;
import com.aibillgenerator.exceptions.ResourceNotFoundException;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.Supplier;
import com.aibillgenerator.models.User;
import com.aibillgenerator.repositories.ProductRepository;
import com.aibillgenerator.repositories.SupplierRepository;
import com.aibillgenerator.services.interfaces.ISupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierServiceImpl implements ISupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository, ProductRepository productRepository) {
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public Supplier createSupplier(User user, SupplierRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Supplier name is required");
        }

        Supplier supplier = new Supplier();
        supplier.setName(request.getName().trim());
        supplier.setContactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : "");
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        supplier.setAddress(request.getAddress() != null ? request.getAddress().trim() : "");
        supplier.setUser(user);

        return supplierRepository.save(supplier);
    }

    @Override
    public List<Supplier> getSuppliers(User user) {
        return supplierRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional
    public Supplier updateSupplier(User user, String supplierId, SupplierRequest request) {
        Supplier supplier = supplierRepository.findByIdAndUser(supplierId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            supplier.setName(request.getName().trim());
        }
        if (request.getContactPerson() != null) {
            supplier.setContactPerson(request.getContactPerson().trim());
        }
        if (request.getPhone() != null) {
            supplier.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            supplier.setAddress(request.getAddress().trim());
        }

        return supplierRepository.save(supplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(User user, String supplierId) {
        Supplier supplier = supplierRepository.findByIdAndUser(supplierId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        supplierRepository.delete(supplier);
    }

    @Override
    @Transactional
    public Product restockProduct(User user, String productId, RestockRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Restock quantity must be positive");
        }

        Product product = productRepository.findByIdAndUser(productId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        double currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0.0;
        product.setStockQuantity(currentStock + request.getQuantity());

        if (request.getCostPrice() != null && request.getCostPrice() >= 0) {
            product.setCostPrice(request.getCostPrice());
        }

        if (request.getExpiryDate() != null) {
            product.setExpiryDate(request.getExpiryDate());
        }

        return productRepository.save(product);
    }
}
