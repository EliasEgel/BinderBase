package org.example.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
    private static final Logger log = LoggerFactory.getLogger(AuthChannelInterceptor.class);

    public AuthChannelInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // We only need to authenticate on the initial CONNECT command
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // "nativeHeaders" are the headers sent by the client in the STOMP connect frame
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            log.info("Authorization header: {}", authHeader);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    Authentication authentication = this.jwtAuthenticationConverter.convert(jwt);

                    // This is the crucial part: we set the user for the WebSocket session
                    accessor.setUser(authentication);
                    log.info("Authenticated user {} for WebSocket session.", authentication.getName());
                } catch (Exception e) {
                    log.error("WebSocket authentication failed: {}", e.getMessage());
                    // You could throw an exception here to deny the connection
                    return null;
                }
            } else {
                log.warn("No Authorization header found for WebSocket CONNECT.");
                return null; // Deny connection if no token
            }
        }
        return message;
    }
}