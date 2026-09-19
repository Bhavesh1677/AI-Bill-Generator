package com.aibillgenerator.services.interfaces;

import com.aibillgenerator.dto.request.RestockRequest;
import com.aibillgenerator.dto.request.SupplierRequest;
import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.Supplier;
import com.aibillgenerator.models.User;
import java.util.List;

public interface ISupplierService {
    Supplier createSupplier(User user, SupplierRequest request);
    List<Supplier> getSuppliers(User user);
    Supplier updateSupplier(User user, String supplierId, SupplierRequest request);
    void deleteSupplier(User user, String supplierId);
    Product restockProduct(User user, String productId, RestockRequest request);
}
