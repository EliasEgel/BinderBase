package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.User;
import org.example.backend.dto.UserDto;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
}