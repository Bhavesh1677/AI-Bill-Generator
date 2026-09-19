package com.aibillgenerator.controllers;

import com.aibillgenerator.dto.request.LoginRequest;
import com.aibillgenerator.dto.request.RefreshTokenRequest;
import com.aibillgenerator.dto.request.RegisterRequest;
import com.aibillgenerator.dto.request.UpdateProfileRequest;
import com.aibillgenerator.dto.response.ApiResponse;
import com.aibillgenerator.dto.response.AuthResponseData;
import com.aibillgenerator.models.User;
import com.aibillgenerator.security.CustomUserDetails;
import com.aibillgenerator.services.interfaces.IUserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return new ResponseEntity<>(
                new ApiResponse<>(201, user, "User registered successfully"),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseData>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponseData authData = userService.login(request, response);
        return ResponseEntity.ok(new ApiResponse<>(200, authData, "User logged In successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletResponse response
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        userService.logout(user, response);
        return ResponseEntity.ok(new ApiResponse<>(200, Collections.emptyMap(), "User logged out successfully"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponseData>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String token = request != null && request.getRefreshToken() != null ? request.getRefreshToken() : null;

        if (token == null && httpRequest.getCookies() != null) {
            for (Cookie cookie : httpRequest.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        AuthResponseData authData = userService.refreshToken(token, httpResponse);
        return ResponseEntity.ok(new ApiResponse<>(200, authData, "Access token refreshed successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(200, user, "Current user fetched successfully"));
    }

    @PatchMapping(value = "/profile", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @ModelAttribute UpdateProfileRequest formRequest,
            @RequestParam(value = "businessLogo", required = false) MultipartFile logoFile
    ) {
        User user = userDetails.getUser();
        User updated = userService.updateProfile(user, formRequest, logoFile);
        return ResponseEntity.ok(new ApiResponse<>(200, updated, "Profile updated successfully"));
    }
}
