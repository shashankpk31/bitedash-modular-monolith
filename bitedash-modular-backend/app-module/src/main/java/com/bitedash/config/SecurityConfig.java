package com.bitedash.config;

import com.bitedash.shared.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless API
            .csrf(AbstractHttpConfigurer::disable)

            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session management (no sessions)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // CORS preflight (MUST be first!)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Static resources (frontend) - MUST be public
                .requestMatchers("/", "/index.html", "/favicon.*", "/logo.*", "/manifest.*",
                                "/pwa-*", "/apple-touch-icon.*", "/masked-icon.*", "/sw.js",
                                "/assets/**", "/workbox-*").permitAll()

                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                // Public organization endpoint for registration (supports both spellings)
                .requestMatchers("/organization/public", "/organisation/public").permitAll()
                // WebSocket endpoints - must be public for handshake
                .requestMatchers("/ws/**").permitAll()
                // SockJS fallback endpoints
                .requestMatchers("/ws/info", "/ws/*/xhr_streaming/**", "/ws/*/xhr_send/**", "/ws/*/xhr/**").permitAll()
                // WARNING: In production, restrict /actuator/** and /swagger-ui/**
                // to admin users only or disable completely for security
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/error").permitAll()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Exception handling - return JSON, not redirect
            .exceptionHandling(exceptions -> exceptions
                // Unauthenticated requests -> 401 JSON response
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("error", "Authentication required");
                    errorResponse.put("message", "Please login to access this resource");

                    ObjectMapper mapper = new ObjectMapper();
                    response.getWriter().write(mapper.writeValueAsString(errorResponse));
                })

                // Access denied -> 403 JSON response
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("error", "Access denied");
                    errorResponse.put("message", "You don't have permission to access this resource");

                    ObjectMapper mapper = new ObjectMapper();
                    response.getWriter().write(mapper.writeValueAsString(errorResponse));
                })
            )

            // JWT authentication filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // Disable form login (no redirects to /login)
            .formLogin(AbstractHttpConfigurer::disable)

            // Disable HTTP Basic auth (no browser popup)
            .httpBasic(AbstractHttpConfigurer::disable)

            // Disable logout (we handle it in frontend)
            .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow localhost (dev) and cloud deployments (AWS, Railway)
        // Note: When frontend is served from same backend, CORS is not triggered
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://*.railway.app",
            "http://*.compute.amazonaws.com:*",
            "https://*.compute.amazonaws.com:*",
            "http://*.elb.amazonaws.com:*",
            "https://*.elb.amazonaws.com:*"
        ));

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose headers in response
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
