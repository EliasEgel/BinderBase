package org.example.backend.controller;

import org.example.backend.dto.CardResponseDto;
import org.example.backend.dto.saveCardDto;
import org.example.backend.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/collection")
public class CollectionController {
    private final CardService cardService;

    @Autowired
    public CollectionController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<?> addCardToCollection(@RequestBody saveCardDto dto) {
        CardResponseDto responseDto = cardService.addCardToCollection(dto);
        return ResponseEntity.ok(
            new ApiResponse<>(true, responseDto, "Card added to collection.")
        );
    }

    @GetMapping
    public ResponseEntity<?> getCardsByUserId(@RequestParam String userId) {
        var cards = cardService.getCardsByUserId(userId);
        return ResponseEntity.ok(
            new ApiResponse<>(true, cards, "Cards fetched for user.")
        );
    }

    public static class ApiResponse<T> {
        public boolean success;
        public T data;
        public String message;
        public ApiResponse(boolean success, T data, String message) {
            this.success = success;
            this.data = data;
            this.message = message;
        }
    }
}
