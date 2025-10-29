package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}