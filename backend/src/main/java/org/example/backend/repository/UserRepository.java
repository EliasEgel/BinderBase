package org.example.backend.repository;

import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Finds a user by their unique Clerk ID.
     * Using Optional is a best practice to handle cases where the user may not exist.
     */
    Optional<User> findByClerkUserId(String clerkUserId);
}
