package org.example.backend.service;

import org.example.backend.dto.saveCardDto;
import org.example.backend.dto.CardResponseDto;
import org.example.backend.model.Card;
import org.example.backend.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CardService {
    private final CardRepository cardRepository;

    @Autowired
    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public CardResponseDto addCardToCollection(saveCardDto dto) {
        Card card = Card.builder()
            .name(dto.getCardName())
            .cardId(dto.getCardId())
            .userId(dto.getUserId())
            .username(dto.getUsername())
            .build();
        Card saved = cardRepository.save(card);
        return CardResponseDto.builder()
            .id(saved.getId())
            .name(saved.getName())
            .cardId(saved.getCardId())
            .username(saved.getUsername())
                .status(saved.getStatus())
            .build();
    }

    public java.util.List<CardResponseDto> getCardsByUserId(String userId) {
        var cards = cardRepository.findByUserId(userId);
        return cards.stream()
            .map(card -> CardResponseDto.builder()
                .id(card.getId())
                .name(card.getName())
                .cardId(card.getCardId())
                .username(card.getUsername())
                    .status(card.getStatus())
                .build())
            .toList();
    }
}
