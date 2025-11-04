package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderClerkId;

    @Column(nullable = false)
    private String recipientClerkId;

    @Column(nullable = false)
    private String senderUsername;

    @Column(nullable = false)
    private String recipientUsername;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp // Automatically sets the timestamp when created
    private Instant timestamp;
}