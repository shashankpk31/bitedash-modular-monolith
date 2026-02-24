package com.bitedash.identity.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.identity.dto.AuthRequest;
import com.bitedash.identity.dto.LoginResponse;
import com.bitedash.identity.dto.RegisterOrgRequest;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.service.AuthService;
import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.dto.EmptyJson;
import com.bitedash.shared.enums.Role;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest user) {
        logger.info("REST request to register user: {}", user.fullName());
        String msg = authService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(msg, new EmptyJson()));
    }

    @PostMapping("/register/org-admin")
    @RequireRole(Role.ROLE_SUPER_ADMIN)
    public ResponseEntity<ApiResponse> registerOrgAdmin(@RequestBody RegisterOrgRequest user) {
        logger.info("REST request to register org admin: {}", user.fullName());
        String msg = authService.registerOrg(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(msg, new EmptyJson()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthRequest authRequest) {
        logger.info("REST request to login user: {}", authRequest.userIdentifier());
        LoginResponse response = authService.login(authRequest.userIdentifier(), authRequest.password());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse> validateToken(@RequestParam("token") String token) {
        authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token is valid", new EmptyJson()));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verify(@RequestParam String identifier, @RequestParam String otp) {
        boolean isVerified = authService.verifyIdentifier(identifier, otp);
        if (isVerified) {
            return ResponseEntity.ok(ApiResponse.success("Account verified successfully", new EmptyJson()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid or expired OTP"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse> resendOtp(@RequestParam String identifier, @RequestParam String type) {
        logger.info("REST request to resend {} OTP for: {}", type, identifier);
        String result = authService.resendOtp(identifier, type);
        return ResponseEntity.ok(ApiResponse.success(result, new EmptyJson()));
    }

    @GetMapping("/admin/pending-approvals")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> getPendingApprovals() {
        logger.info("REST request to get pending user approvals");
        return ResponseEntity.ok(
            ApiResponse.success("Pending approvals fetched successfully", authService.getPendingApprovals())
        );
    }

    @PutMapping("/admin/users/{userId}/status")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        logger.info("REST request to update user {} status to: {}", userId, status);
        String message = authService.updateUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(message, new EmptyJson()));
    }
}
