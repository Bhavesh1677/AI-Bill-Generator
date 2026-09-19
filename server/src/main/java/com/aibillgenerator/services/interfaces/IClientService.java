package com.aibillgenerator.services.interfaces;

import com.aibillgenerator.dto.request.ClientRequest;
import com.aibillgenerator.dto.request.KhataPaymentRequest;
import com.aibillgenerator.models.Client;
import com.aibillgenerator.models.User;
import java.util.List;

public interface IClientService {
    Client createClient(User user, ClientRequest request);
    List<Client> getClients(User user);
    Client getClientById(User user, String clientId);
    Client updateClient(User user, String clientId, ClientRequest request);
    void deleteClient(User user, String clientId);
    Client recordKhataPayment(User user, String clientId, KhataPaymentRequest request);
}
