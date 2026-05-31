package com.bitedash.identity.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
import com.bitedash.shared.security.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest user) {
        logger.info("REST request to register user: {}", user.fullName());
        String msg = authService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(msg, new EmptyJson()));
    }

    @PostMapping("/register/org-admin")
    @RequireRole(Role.ROLE_SUPER_ADMIN)
    public ResponseEntity<ApiResponse> registerOrgAdmin(@Valid @RequestBody RegisterOrgRequest user) {
        logger.info("REST request to register org admin: {}", user.fullName());
        String msg = authService.registerOrg(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(msg, new EmptyJson()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        logger.info("REST request to login user: {}", authRequest.userIdentifier());
        LoginResponse response = authService.login(authRequest.userIdentifier(), authRequest.password());

        // WHY HTTP-only cookies? Prevents XSS attacks from stealing JWT tokens.
        // JavaScript cannot access HTTP-only cookies, so even if an attacker injects
        // malicious scripts, they cannot extract the authentication token.
        // SameSite=Lax prevents CSRF on state-changing requests.
        ResponseCookie accessCookie = jwtService.createAccessTokenCookie(response.getToken());

        // WHY return user data without tokens in body? The tokens are in cookies only.
        // This maintains backward compatibility - frontend still gets user info for UI,
        // but tokens are only accessible via secure cookies.
        LoginResponse safeResponse = new LoginResponse();
        safeResponse.setUser(response.getUser());
        safeResponse.setToken(null);  // Don't expose token in response body - it's in the cookie

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .body(ApiResponse.success("Login successful", safeResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        logger.info("REST request to logout user");

        // Clear JWT cookies by creating expired cookies with same name
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .body(ApiResponse.success("Logged out successfully", new EmptyJson()));
    }

    /**
     * Validate current session token from HTTP-only cookie.
     * Used by frontend to check if user is still authenticated after page refresh.
     *
     * GET /auth/validate
     * @return Success if token in cookie is valid
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse> validateToken(HttpServletRequest request) {
        // Extract token from HTTP-only cookie (not from parameter)
        String token = jwtService.extractTokenFromCookies(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("No valid session found"));
        }

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
