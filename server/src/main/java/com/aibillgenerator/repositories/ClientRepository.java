package com.aibillgenerator.repositories;

import com.aibillgenerator.models.Client;
import com.aibillgenerator.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {
    List<Client> findByUserOrderByCreatedAtDesc(User user);
    Optional<Client> findByIdAndUser(String id, User user);
}
