package com.bitedash.shared.security;

import com.bitedash.shared.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret:myVerySecretKeyForJwtTokenGenerationThatIsAtLeast256BitsLong}")
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
}
