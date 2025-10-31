package org.example.backend.controller;

import org.example.backend.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Principal;

@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/private-message")
    public void sendPrivateMessage(@Payload ChatMessage message, Principal principal) {
        String authenticatedSenderId = principal.getName();
        message.setSenderClerkId(authenticatedSenderId);

        log.info("Routing message from {} to {}", message.getSenderClerkId(), message.getRecipientClerkId());

        messagingTemplate.convertAndSendToUser(
                message.getRecipientClerkId(), // The recipient's unique Clerk ID
                "/private",                   // The private queue name
                message                       // The payload
        );
    }
}