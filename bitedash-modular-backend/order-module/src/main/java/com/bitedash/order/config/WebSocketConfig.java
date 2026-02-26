package com.bitedash.order.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time order updates.
 * Configures STOMP over WebSocket for bidirectional communication.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker
        // Clients subscribe to /topic for broadcast messages and /queue for user-specific messages
        config.enableSimpleBroker("/topic", "/queue");

        // Application destination prefix for messages from clients
        config.setApplicationDestinationPrefixes("/app");

        // User destination prefix for user-specific messages
        config.setUserDestinationPrefix("/user"); 
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint for WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins (configure for production)
                .withSockJS(); // Enable SockJS fallback for browsers that don't support WebSocket
    }
}
