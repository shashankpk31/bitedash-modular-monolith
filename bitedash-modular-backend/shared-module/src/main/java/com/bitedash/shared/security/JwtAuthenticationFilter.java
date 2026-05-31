package com.bitedash.shared.security;

import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Skip JWT processing for OPTIONS requests (CORS preflight)
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            // Try to get token from HTTP-only cookie first (more secure)
            String token = extractTokenFromCookie(request);
            String authHeader = null;

            // Fallback to Authorization header for backward compatibility
            if (token == null) {
                authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token != null) {

            if (jwtService.validateToken(token)) {
                String username = jwtService.extractUsername(token);
                Long userId = jwtService.extractUserId(token);
                Role role = jwtService.extractRole(token);
                Long orgId = jwtService.extractOrgId(token);
                Long officeId = jwtService.extractOfficeId(token);

                // Build auth header for context (use cookie token if no header)
                String authHeaderForContext = authHeader != null ? authHeader : "Bearer " + token;

                // Set UserContext for thread-local access
                UserContext.UserContextHolder context = new UserContext.UserContextHolder(
                        authHeaderForContext,
                        userId,
                        username,
                        role.name(),
                        orgId,
                        officeId
                );
                UserContext.set(context);

                // Set Spring Security context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(new SimpleGrantedAuthority(role.name()))
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Extract JWT token from HTTP-only cookie.
     */
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
            .filter(cookie -> "accessToken".equals(cookie.getName()))
            .map(Cookie::getValue)
            .filter(value -> value != null && !value.isEmpty())
            .findFirst()
            .orElse(null);
    }
}
