package org.example.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "card_id", nullable = false)
    String cardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status = CardStatus.IN_COLLECTION;

    /** The proposed price if the card is for sale. */
    @Column(precision = 10, scale = 2) // For amounts up to 99,999,999.99
    private BigDecimal price;
}
