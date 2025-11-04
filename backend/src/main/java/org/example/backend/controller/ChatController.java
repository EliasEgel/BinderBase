package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.model.ChatMessage;
import org.example.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService; // Inject ChatService

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    /**
     * WebSocket endpoint for real-time messages.
     */
    @MessageMapping("/private-message")
    public void sendPrivateMessage(@Payload ChatMessage message, Principal principal) {
        String authenticatedSenderId = principal.getName();
        message.setSenderClerkId(authenticatedSenderId);

        // Save the message to the database
        ChatMessage savedMessage = chatService.saveMessage(message);
        log.info("Saved and routing message from {} to {}", savedMessage.getSenderClerkId(), savedMessage.getRecipientClerkId());

        //Send the *saved* message (with server timestamp) to the recipient
        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipientClerkId(),
                "/private",
                savedMessage
        );
    }

    /**
     * REST endpoint to fetch chat history.
     */
    @GetMapping("/history/{recipientClerkId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getChatHistory(
            @PathVariable String recipientClerkId,
            @AuthenticationPrincipal Jwt principal) {

        String senderClerkId = principal.getSubject(); // Get current user's ID from JWT
        List<ChatMessage> history = chatService.getConversationHistory(senderClerkId, recipientClerkId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, history, "Chat history fetched successfully.")
        );
    }
}