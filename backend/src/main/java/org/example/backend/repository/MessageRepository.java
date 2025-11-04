package org.example.backend.repository;

import org.example.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Finds all messages exchanged between two users, in chronological order.
     * This query finds messages where:
     * (user1 was sender AND user2 was recipient)
     * OR
     * (user2 was sender AND user1 was recipient)
     */
    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderClerkId = :clerkId1 AND m.recipientClerkId = :clerkId2) OR " +
            "(m.senderClerkId = :clerkId2 AND m.recipientClerkId = :clerkId1) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findConversationHistory(@Param("clerkId1") String clerkId1,
                                          @Param("clerkId2") String clerkId2);
}
