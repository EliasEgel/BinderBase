package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.ChatMessage;
import org.example.backend.model.Message;
import org.example.backend.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;

    /**
     * Saves a new chat message to the database.
     * @param messageDto The ChatMessage DTO containing message details.
     * @return The saved ChatMessage DTO.
     */
    @Transactional
    public ChatMessage saveMessage(ChatMessage messageDto) {
        Message message = Message.builder()
                .senderClerkId(messageDto.getSenderClerkId())
                .recipientClerkId(messageDto.getRecipientClerkId())
                .senderUsername(messageDto.getSenderUsername())
                .recipientUsername(messageDto.getRecipientUsername())
                .content(messageDto.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);
        return toDto(savedMessage);
    }

    /**
     * Retrieves the full chat history between two users.
     * @param clerkId1 The Clerk ID of the first user.
     * @param clerkId2 The Clerk ID of the second user.
     * @return A list of ChatMessage DTOs.
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getConversationHistory(String clerkId1, String clerkId2) {
        return messageRepository.findConversationHistory(clerkId1, clerkId2)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private ChatMessage toDto(Message message) {
        return ChatMessage.builder()
                .senderClerkId(message.getSenderClerkId())
                .recipientClerkId(message.getRecipientClerkId())
                .senderUsername(message.getSenderUsername())
                .recipientUsername(message.getRecipientUsername())
                .content(message.getContent())
                .timestamp(message.getTimestamp().toString()) // Convert Instant to String
                .build();
    }
}