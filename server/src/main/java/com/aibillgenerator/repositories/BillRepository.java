package com.aibillgenerator.repositories;

import com.aibillgenerator.models.Bill;
import com.aibillgenerator.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    List<Bill> findByUserOrderByCreatedAtDesc(User user);
    List<Bill> findByUserOrderByIssueDateDesc(User user);
    Optional<Bill> findByIdAndUser(String id, User user);
    long countByUser(User user);
    List<Bill> findByUser(User user);
}
