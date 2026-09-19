package com.aibillgenerator.services.impl;

import com.aibillgenerator.dto.request.ClientRequest;
import com.aibillgenerator.dto.request.KhataPaymentRequest;
import com.aibillgenerator.exceptions.BadRequestException;
import com.aibillgenerator.exceptions.ResourceNotFoundException;
import com.aibillgenerator.models.Client;
import com.aibillgenerator.models.KhataHistoryEntry;
import com.aibillgenerator.models.User;
import com.aibillgenerator.repositories.ClientRepository;
import com.aibillgenerator.repositories.KhataHistoryRepository;
import com.aibillgenerator.services.interfaces.IClientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClientServiceImpl implements IClientService {

    private final ClientRepository clientRepository;
    private final KhataHistoryRepository khataHistoryRepository;

    public ClientServiceImpl(ClientRepository clientRepository, KhataHistoryRepository khataHistoryRepository) {
        this.clientRepository = clientRepository;
        this.khataHistoryRepository = khataHistoryRepository;
    }

    @Override
    @Transactional
    public Client createClient(User user, ClientRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Name is required");
        }

        Client client = new Client();
        client.setName(request.getName().trim());
        client.setBusinessName(request.getBusinessName() != null ? request.getBusinessName().trim() : "");
        client.setEmail(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim().toLowerCase() : null);
        client.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        client.setAddress(request.getAddress() != null ? request.getAddress().trim() : "");
        client.setCreditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : 5000.0);
        client.setOutstandingBalance(0.0);
        client.setUser(user);

        return clientRepository.save(client);
    }

    @Override
    public List<Client> getClients(User user) {
        return clientRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public Client getClientById(User user, String clientId) {
        return clientRepository.findByIdAndUser(clientId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found or you are not authorized to view it"));
    }

    @Override
    @Transactional
    public Client updateClient(User user, String clientId, ClientRequest request) {
        Client client = getClientById(user, clientId);

        if (request.getName() != null && !request.getName().isBlank()) {
            client.setName(request.getName().trim());
        }
        if (request.getBusinessName() != null) {
            client.setBusinessName(request.getBusinessName().trim());
        }
        if (request.getEmail() != null) {
            client.setEmail(!request.getEmail().isBlank() ? request.getEmail().trim().toLowerCase() : null);
        }
        if (request.getPhone() != null) {
            client.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            client.setAddress(request.getAddress().trim());
        }
        if (request.getCreditLimit() != null) {
            client.setCreditLimit(request.getCreditLimit());
        }

        return clientRepository.save(client);
    }

    @Override
    @Transactional
    public void deleteClient(User user, String clientId) {
        Client client = getClientById(user, clientId);
        clientRepository.delete(client);
    }

    @Override
    @Transactional
    public Client recordKhataPayment(User user, String clientId, KhataPaymentRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        Client client = getClientById(user, clientId);

        // Deduct from outstanding balance
        double currentBalance = client.getOutstandingBalance() != null ? client.getOutstandingBalance() : 0.0;
        client.setOutstandingBalance(currentBalance - request.getAmount());

        // Create ledger entry
        KhataHistoryEntry entry = new KhataHistoryEntry();
        entry.setClient(client);
        entry.setType("payment");
        entry.setAmount(request.getAmount());
        entry.setRemarks(request.getRemarks() != null && !request.getRemarks().isBlank() ? request.getRemarks() : "Cash payment repayment");
        entry.setDate(LocalDateTime.now());

        client.getKhataHistory().add(entry);

        return clientRepository.save(client);
    }
}
