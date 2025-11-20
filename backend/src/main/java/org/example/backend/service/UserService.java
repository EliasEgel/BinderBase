package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.User;
import org.example.backend.dto.UserDto;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    /**
     * Finds a user by their Clerk ID. If the user does not exist,
     * it creates and saves a new user.
     *
     * @param clerkUserId The user's unique ID from Clerk.
     * @param username    The user's username.
     * @return The existing or newly created User entity.
     */
    @Transactional
    public User findOrCreateUser(String clerkUserId, String username) {
        return userRepository.findByClerkUserId(clerkUserId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .clerkUserId(clerkUserId)
                            .username(username)
                            .build();
                    return userRepository.save(newUser);
                });
    }

    /**
     * Fetches all users from the database, converts them to DTOs,
     * and filters out the user who is making the request.
     *
     * @param clerkUserIdOfCurrentUser The Clerk ID of the logged-in user.
     * @return A list of UserDto objects.
     */
    @Transactional(readOnly = true)
    public List<UserDto> getAllChatUsers(String clerkUserIdOfCurrentUser) {
        return userRepository.findAll()
                .stream()
                // Filter out the current user (you don't want to chat with yourself)
                .filter(user -> !user.getClerkUserId().equals(clerkUserIdOfCurrentUser))
                // Map to the safe DTO
                .map(user -> new UserDto(user.getUsername(), user.getClerkUserId()))
                .collect(Collectors.toList());
    }

    /**
     * Returns users who have an existing chat history with the current user.
     */
    @Transactional(readOnly = true)
    public List<UserDto> getUsersWithChatHistory(String currentUserClerkId) {
        // 1. Get IDs of everyone we've talked to
        List<String> partnerIds = messageRepository.findChatPartnerIds(currentUserClerkId);

        // 2. Find those User entities in the database
        // (Note: You might need to add 'findByClerkUserIdIn' to UserRepository, or just filter/loop)
        return userRepository.findAll().stream()
                .filter(user -> partnerIds.contains(user.getClerkUserId()))
                .map(user -> new UserDto(user.getUsername(), user.getClerkUserId()))
                .collect(Collectors.toList());
    }
}