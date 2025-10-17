package org.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/collection")
public class CollectionController {

    // Simple in-memory list for demonstration (replace with service/db later)
    private final List<String> cardCollection = new ArrayList<>();

    @GetMapping
    public ResponseEntity<?> getAllCards() {
        return ResponseEntity.ok(
            new ApiResponse<>(true, cardCollection, "Fetched all cards in collection.")
        );
    }

    @PostMapping
    public ResponseEntity<?> addCardToCollection(@RequestBody String card) {
        cardCollection.add(card);
        return ResponseEntity.ok(
            new ApiResponse<>(true, card, "Card added to collection.")
        );
    }

    // Response wrapper as per project conventions
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
