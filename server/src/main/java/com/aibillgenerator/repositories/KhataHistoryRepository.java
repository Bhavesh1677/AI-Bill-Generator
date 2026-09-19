package com.aibillgenerator.repositories;

import com.aibillgenerator.models.KhataHistoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhataHistoryRepository extends JpaRepository<KhataHistoryEntry, String> {
}
