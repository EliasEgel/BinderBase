package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CardResponseDto;
import org.example.backend.model.Card;
import org.example.backend.model.CardStatus;
import org.example.backend.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Automatically injects final fields via constructor
public class MarketplaceService {

    private final CardRepository cardRepository;

    /**
     * Lists a card for sale.
     * @param cardDbId The database ID of the card to sell.
     * @param price The proposed selling price.
     * @param currentUserId The ID of the user performing the action (for security).
     * @return The updated card data.
     */
    @Transactional
    public CardResponseDto listCardForSale(Long cardDbId, BigDecimal price, String currentUserId) {
        Card card = findAndVerifyOwnership(cardDbId, currentUserId);

        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be a positive value.");
        }

        card.setStatus(CardStatus.FOR_SALE);
        card.setPrice(price);
        Card updatedCard = cardRepository.save(card);

        return toDto(updatedCard);
    }

    /**
     * Removes a card listing from the marketplace.
     */
    @Transactional
    public CardResponseDto unlistCard(Long cardDbId, String currentUserId) {
        Card card = findAndVerifyOwnership(cardDbId, currentUserId);

        card.setStatus(CardStatus.IN_COLLECTION);
        card.setPrice(null); // Clear the price
        Card updatedCard = cardRepository.save(card);

        return toDto(updatedCard);
    }

    /**
     * Marks a card as sold.
     */
    @Transactional
    public CardResponseDto markCardAsSold(Long cardDbId, String currentUserId) {
        Card card = findAndVerifyOwnership(cardDbId, currentUserId);

        if (card.getStatus() != CardStatus.FOR_SALE) {
            throw new IllegalStateException("Card must be listed for sale to be marked as sold.");
        }

        card.setStatus(CardStatus.SOLD);
        Card updatedCard = cardRepository.save(card);

        return toDto(updatedCard);
    }

    /**
     * Retrieves all cards currently listed on the marketplace.
     */
    @Transactional(readOnly = true)
    public List<CardResponseDto> getAllCardsForSale() {
        return cardRepository.findAllByStatus(CardStatus.FOR_SALE)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * A private helper to find a card and verify the current user owns it.
     */
    private Card findAndVerifyOwnership(Long cardDbId, String currentUserId) {
        Card card = cardRepository.findById(cardDbId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardDbId)); // TODO: Use a proper custom exception

        if (!card.getUser().getClerkUserId().equals(currentUserId)) {
            // This prevents one user from selling another user's cards
            throw new SecurityException("User does not have permission to modify this card."); // TODO: Use a proper custom exception
        }
        return card;
    }

    /**
     * Maps a Card entity to a CardResponseDto.
     */
    private CardResponseDto toDto(Card card) {
        return CardResponseDto.builder()
                .id(card.getId())
                .name(card.getName())
                .username(card.getUser().getUsername())
                .cardId(card.getCardId())
                .status(card.getStatus())
                .price(card.getPrice())
                .build();
    }
}
