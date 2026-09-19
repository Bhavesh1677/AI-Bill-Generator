package com.aibillgenerator.controllers;

import com.aibillgenerator.dto.request.ClientRequest;
import com.aibillgenerator.dto.request.KhataPaymentRequest;
import com.aibillgenerator.dto.response.ApiResponse;
import com.aibillgenerator.models.Client;
import com.aibillgenerator.security.CustomUserDetails;
import com.aibillgenerator.services.interfaces.IClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {

    private final IClientService clientService;

    public ClientController(IClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Client>> createClient(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ClientRequest request
    ) {
        Client client = clientService.createClient(userDetails.getUser(), request);
        return new ResponseEntity<>(
                new ApiResponse<>(201, client, "Client created successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Client>>> getClients(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Client> clients = clientService.getClients(userDetails.getUser());
        return ResponseEntity.ok(new ApiResponse<>(200, clients, "Clients fetched successfully"));
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<ApiResponse<Client>> getClientById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String clientId
    ) {
        Client client = clientService.getClientById(userDetails.getUser(), clientId);
        return ResponseEntity.ok(new ApiResponse<>(200, client, "Client details fetched successfully"));
    }

    @PatchMapping("/{clientId}")
    public ResponseEntity<ApiResponse<Client>> updateClient(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String clientId,
            @RequestBody ClientRequest request
    ) {
        Client client = clientService.updateClient(userDetails.getUser(), clientId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, client, "Client updated successfully"));
    }

    @DeleteMapping("/{clientId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteClient(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String clientId
    ) {
        clientService.deleteClient(userDetails.getUser(), clientId);
        return ResponseEntity.ok(new ApiResponse<>(200, Collections.emptyMap(), "Client deleted successfully"));
    }

    @PostMapping("/khata-payment/{clientId}")
    public ResponseEntity<ApiResponse<Client>> recordKhataPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String clientId,
            @Valid @RequestBody KhataPaymentRequest request
    ) {
        Client client = clientService.recordKhataPayment(userDetails.getUser(), clientId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, client, "Payment recorded successfully in customer Khata ledger"));
    }
}
