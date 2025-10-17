package org.example.backend.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    @Id
    private Long id;

    private String name;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "card_id", nullable = false)
    String cardId;
}
