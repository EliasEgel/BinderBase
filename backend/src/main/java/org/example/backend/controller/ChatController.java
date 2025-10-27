package org.example.backend.controller;

import org.example.backend.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handles incoming private messages.
     * The client will send messages to the destination "/app/private-message".
     *
     * @param message The ChatMessage DTO from the client.
     */
    @MessageMapping("/private-message")
    public void sendPrivateMessage(@Payload ChatMessage message) {
        log.info("Received private message: {}", message.getContent());

        // This is the core logic for DMs.
        // SimpMessagingTemplate knows how to route a message to a specific user.
        // It will send the message to the destination:
        // /user/{recipientUsername}/private
        //
        // The frontend client must be subscribed to this destination.
        messagingTemplate.convertAndSendToUser(
                message.getRecipientUsername(), // The recipient's username
                "/private", // The private queue name
                message       // The payload (our message)
        );
    }

    // You can add other mappings here, e.g., for user status (typing, online)
    // @MessageMapping("/user-status")
    // ...
}
