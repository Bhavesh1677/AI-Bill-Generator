package com.aibillgenerator.repositories;

import com.aibillgenerator.models.Product;
import com.aibillgenerator.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByUserOrderByCreatedAtDesc(User user);
    Optional<Product> findByIdAndUser(String id, User user);
    List<Product> findByUser(User user);
}
