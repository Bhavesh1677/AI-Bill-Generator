package com.aibillgenerator.services.impl;

import com.aibillgenerator.dto.request.ProductRequest;
import com.aibillgenerator.exceptions.BadRequestException;
import com.aibillgenerator.exceptions.ResourceNotFoundException;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.User;
import com.aibillgenerator.repositories.ProductRepository;
import com.aibillgenerator.services.interfaces.IProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductServiceImpl implements IProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public Product createProduct(User user, ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank() || request.getPrice() == null) {
            throw new BadRequestException("Name and price are required");
        }

        if (request.getPrice() < 0) {
            throw new BadRequestException("Price cannot be negative");
        }

        if (request.getCostPrice() != null && request.getCostPrice() < 0) {
            throw new BadRequestException("Cost price cannot be negative");
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setBrandName(request.getBrandName() != null ? request.getBrandName().trim() : "");
        product.setSize(request.getSize() != null ? request.getSize() : 1.0);
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice() != null ? request.getCostPrice() : 0.0);
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0.0);
        product.setMinStockLevel(request.getMinStockLevel() != null ? request.getMinStockLevel() : 10.0);
        product.setExpiryDate(request.getExpiryDate());
        product.setCategory(request.getCategory() != null && !request.getCategory().isBlank() ? request.getCategory() : "Other");
        product.setUnit(request.getUnit() != null && !request.getUnit().isBlank() ? request.getUnit() : "pieces");
        product.setUser(user);

        return productRepository.save(product);
    }

    @Override
    public List<Product> getProducts(User user) {
        return productRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public Product getProductById(User user, String productId) {
        return productRepository.findByIdAndUser(productId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found or you are not authorized to view it"));
    }

    @Override
    @Transactional
    public Product updateProduct(User user, String productId, ProductRequest request) {
        Product product = getProductById(user, productId);

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName().trim());
        }
        if (request.getBrandName() != null) {
            product.setBrandName(request.getBrandName().trim());
        }
        if (request.getSize() != null) {
            product.setSize(request.getSize());
        }
        if (request.getPrice() != null) {
            if (request.getPrice() < 0) {
                throw new BadRequestException("Price cannot be negative");
            }
            product.setPrice(request.getPrice());
        }
        if (request.getCostPrice() != null) {
            if (request.getCostPrice() < 0) {
                throw new BadRequestException("Cost price cannot be negative");
            }
            product.setCostPrice(request.getCostPrice());
        }
        if (request.getStockQuantity() != null) {
            if (request.getStockQuantity() < 0) {
                throw new BadRequestException("Stock quantity cannot be negative");
            }
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getMinStockLevel() != null) {
            if (request.getMinStockLevel() < 0) {
                throw new BadRequestException("Min stock level cannot be negative");
            }
            product.setMinStockLevel(request.getMinStockLevel());
        }
        if (request.getExpiryDate() != null) {
            product.setExpiryDate(request.getExpiryDate());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            product.setCategory(request.getCategory());
        }
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            product.setUnit(request.getUnit());
        }

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(User user, String productId) {
        Product product = getProductById(user, productId);
        productRepository.delete(product);
    }
}
