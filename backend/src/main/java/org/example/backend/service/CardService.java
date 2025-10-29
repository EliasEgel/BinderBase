package org.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.example.backend.dto.CardResponseDto;
import org.example.backend.dto.saveCardDto;
import org.example.backend.model.Card;
import org.example.backend.model.CardStatus;
import org.example.backend.model.User;
import org.example.backend.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final UserService userService;

    /**
     * Adds a card to a user's collection.
     * It finds or creates the user based on the provided IDs before adding the card.
     */
    @Transactional
    public CardResponseDto addCardToCollection(saveCardDto dto) {
        User user = userService.findOrCreateUser(dto.getUserId(), dto.getUsername());
        Card newCard = Card.builder()
                .name(dto.getCardName())
                .cardId(dto.getCardId())
                .user(user) // Link the User object, not just the ID.
                .status(CardStatus.IN_COLLECTION) // Explicitly set the default status
                .build();

        Card savedCard = cardRepository.save(newCard);

        return toDto(savedCard);
    }

    /**
     * Retrieves all cards for a user based on their Clerk ID.
     */
    @Transactional(readOnly = true)
    public List<CardResponseDto> getCardsByUserId(String clerkUserId) {
        return cardRepository.findAllByUser_ClerkUserId(clerkUserId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to map a Card entity to a CardResponseDto.
     */
    private CardResponseDto toDto(Card card) {
        return CardResponseDto.builder()
                .id(card.getId())
                .name(card.getName())
                .cardId(card.getCardId())
                .username(card.getUser().getUsername())
                .status(card.getStatus())
                .price(card.getPrice())
                .build();
    }
}
