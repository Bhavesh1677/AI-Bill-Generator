package com.aibillgenerator.repositories;

import com.aibillgenerator.models.Bill;
import com.aibillgenerator.models.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, String> {
    List<BillItem> findByBill(Bill bill);
    List<BillItem> findByBillIn(Collection<Bill> bills);
    void deleteByBill(Bill bill);
}
