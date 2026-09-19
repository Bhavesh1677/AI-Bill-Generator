package com.aibillgenerator.services.impl;

import com.aibillgenerator.dto.request.LoginRequest;
import com.aibillgenerator.dto.request.RegisterRequest;
import com.aibillgenerator.dto.request.UpdateProfileRequest;
import com.aibillgenerator.dto.response.AuthResponseData;
import com.aibillgenerator.exceptions.BadRequestException;
import com.aibillgenerator.exceptions.ConflictException;
import com.aibillgenerator.exceptions.ResourceNotFoundException;
import com.aibillgenerator.exceptions.UnauthorizedException;
import com.aibillgenerator.models.User;
import com.aibillgenerator.repositories.UserRepository;
import com.aibillgenerator.security.JwtUtils;
import com.aibillgenerator.services.interfaces.IStorageService;
import com.aibillgenerator.services.interfaces.IUserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final IStorageService storageService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            IStorageService storageService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.storageService = storageService;
    }

    @Override
    @Transactional
    public User register(RegisterRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(trimmedEmail)) {
            throw new ConflictException("User with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(trimmedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthResponseData login(LoginRequest request, HttpServletResponse response) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(trimmedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid user credentials");
        }

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        addAuthCookies(response, accessToken, refreshToken);

        return new AuthResponseData(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public void logout(User user, HttpServletResponse response) {
        if (user != null) {
            user.setRefreshToken(null);
            userRepository.save(user);
        }
        clearAuthCookies(response);
    }

    @Override
    @Transactional
    public AuthResponseData refreshToken(String incomingRefreshToken, HttpServletResponse response) {
        if (incomingRefreshToken == null || incomingRefreshToken.isBlank()) {
            throw new UnauthorizedException("Unauthorized request: Refresh token is missing");
        }

        if (!jwtUtils.validateToken(incomingRefreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String userId = jwtUtils.getUserIdFromToken(incomingRefreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!incomingRefreshToken.equals(user.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token is expired or used");
        }

        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        addAuthCookies(response, newAccessToken, newRefreshToken);

        return new AuthResponseData(user, newAccessToken, newRefreshToken);
    }

    @Override
    public User getCurrentUser(User user) {
        return user;
    }

    @Override
    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request, MultipartFile logoFile) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            existingUser.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String trimmedEmail = request.getEmail().trim().toLowerCase();
            if (!trimmedEmail.equalsIgnoreCase(existingUser.getEmail())) {
                if (userRepository.existsByEmail(trimmedEmail)) {
                    throw new ConflictException("User with this email already exists");
                }
                existingUser.setEmail(trimmedEmail);
            }
        }

        if (request.getBusinessName() != null) {
            existingUser.setBusinessName(request.getBusinessName().trim());
        }
        if (request.getPhone() != null) {
            existingUser.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            existingUser.setAddress(request.getAddress().trim());
        }
        if (request.getUpiId() != null) {
            existingUser.setUpiId(request.getUpiId().trim());
        }

        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = storageService.store(logoFile);
            if (logoUrl != null) {
                existingUser.setBusinessLogo(logoUrl);
            }
        }

        return userRepository.save(existingUser);
    }

    private void addAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        if (response == null) return;

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(86400)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(864000)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearAuthCookies(HttpServletResponse response) {
        if (response == null) return;

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }
}
