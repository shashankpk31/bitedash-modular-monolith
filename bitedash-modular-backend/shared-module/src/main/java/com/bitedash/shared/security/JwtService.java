package com.bitedash.shared.security;

import com.bitedash.shared.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Duration;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}") // 24 hours
    private Long expiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(Long userId, String username, Role role, Long orgId, Long officeId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role.name());
        if (orgId != null) {
            claims.put("orgId", orgId);
        }
        if (officeId != null) {
            claims.put("officeId", officeId);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public Role extractRole(String token) {
        String roleStr = extractClaims(token).get("role", String.class);
        return Role.valueOf(roleStr);
    }

    public Long extractOrgId(String token) {
        return extractClaims(token).get("orgId", Long.class);
    }

    public Long extractOfficeId(String token) {
        return extractClaims(token).get("officeId", Long.class);
    }

    /**
     * Extract user ID from HTTP request.
     * Extracts JWT from cookies or Authorization header and returns the user ID.
     *
     * @param request HTTP request
     * @return User ID from token
     * @throws RuntimeException if token not found or invalid
     */
    public Long extractUserIdFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new RuntimeException("Authentication token not found");
        }
        return extractUserId(token);
    }

    /**
     * Extract JWT token from HTTP-only cookies.
     * Public method for controllers that need to validate cookies.
     *
     * @param request HTTP request
     * @return JWT token from accessToken cookie, or null if not found
     */
    public String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                .filter(c -> "accessToken".equals(c.getName()))
                .map(Cookie::getValue)
                .filter(v -> v != null && !v.isEmpty())
                .findFirst()
                .orElse(null);
        }
        return null;
    }

    /**
     * Extract JWT token from request (cookies first, then Authorization header).
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Try cookies first (HTTP-only secure cookies)
        String cookieToken = extractTokenFromCookies(request);
        if (cookieToken != null) {
            return cookieToken;
        }

        // Fallback to Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    /**
     * Create HTTP-only secure cookie for access token.
     * Cookie is secure (HTTPS only in production), HTTP-only (no JS access), and SameSite=Lax.
     */
    public ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from("accessToken", token)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(Duration.ofHours(24))
            .sameSite("Lax")
            .build();
    }

    /**
     * Create HTTP-only secure cookie for refresh token.
     */
    public ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(Duration.ofDays(7))
            .sameSite("Lax")
            .build();
    }

    /**
     * Create cookie that clears the token (for logout).
     */
    public ResponseCookie createLogoutCookie(String cookieName) {
        return ResponseCookie.from(cookieName, "")
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
    }
}
