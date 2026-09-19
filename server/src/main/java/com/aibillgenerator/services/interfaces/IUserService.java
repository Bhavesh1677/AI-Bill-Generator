package com.aibillgenerator.services.interfaces;

import com.aibillgenerator.dto.request.LoginRequest;
import com.aibillgenerator.dto.request.RegisterRequest;
import com.aibillgenerator.dto.request.UpdateProfileRequest;
import com.aibillgenerator.dto.response.AuthResponseData;
import com.aibillgenerator.models.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

public interface IUserService {
    User register(RegisterRequest request);
    AuthResponseData login(LoginRequest request, HttpServletResponse response);
    void logout(User user, HttpServletResponse response);
    AuthResponseData refreshToken(String incomingRefreshToken, HttpServletResponse response);
    User getCurrentUser(User user);
    User updateProfile(User user, UpdateProfileRequest request, MultipartFile logoFile);
}
