package com.aibillgenerator.services.interfaces;

import com.aibillgenerator.dto.request.ProductRequest;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.User;
import java.util.List;

public interface IProductService {
    Product createProduct(User user, ProductRequest request);
    List<Product> getProducts(User user);
    Product getProductById(User user, String productId);
    Product updateProduct(User user, String productId, ProductRequest request);
    void deleteProduct(User user, String productId);
}
