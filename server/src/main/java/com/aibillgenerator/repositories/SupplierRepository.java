package com.aibillgenerator.repositories;

import com.aibillgenerator.models.Supplier;
import com.aibillgenerator.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, String> {
    List<Supplier> findByUserOrderByCreatedAtDesc(User user);
    Optional<Supplier> findByIdAndUser(String id, User user);
}
