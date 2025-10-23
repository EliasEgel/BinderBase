package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CardResponseDto;
import org.example.backend.dto.ListCardDto;
import org.example.backend.dto.ChangeCardStatusDto;
import org.example.backend.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.controller.CollectionController.ApiResponse;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    /**
     * 🟢 **LIST card for sale:** Updates a card's status to FOR_SALE.
     * The card's database ID is in the URL, and the price is in the request body.
     * Method: PUT, since it's an idempotent update on a known resource.
     */
    @PutMapping("/list/{cardDbId}")
    public ResponseEntity<ApiResponse<CardResponseDto>> listCardForSale(
            @PathVariable Long cardDbId,
            @RequestBody ListCardDto dto) {

        CardResponseDto responseDto = marketplaceService.listCardForSale(cardDbId, dto.getPrice(), dto.getUserId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, responseDto, "Card listed for sale successfully.")
        );
    }

    /**
     * 🟡 **UNLIST card:** Reverts a card's status back to IN_COLLECTION.
     */
    @PutMapping("/unlist/{cardDbId}")
    public ResponseEntity<ApiResponse<CardResponseDto>> unlistCard(@PathVariable Long cardDbId, @RequestBody ChangeCardStatusDto dto) {
        CardResponseDto responseDto = marketplaceService.unlistCard(cardDbId, dto.getUserId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, responseDto, "Card listing removed successfully.")
        );
    }

    /**
     * 🔴 **MARK card as sold:** Sets a card's status to SOLD.
     */
    @PutMapping("/sold/{cardDbId}")
    public ResponseEntity<ApiResponse<CardResponseDto>> markCardAsSold(@PathVariable Long cardDbId, @RequestBody ChangeCardStatusDto dto) {
        CardResponseDto responseDto = marketplaceService.markCardAsSold(cardDbId, dto.getUserId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, responseDto, "Card marked as sold successfully.")
        );
    }

    /**
     * 🔵 **GET all listings:** Retrieves all cards from all users that are currently FOR_SALE.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CardResponseDto>>> getAllCardsForSale() {
        List<CardResponseDto> cards = marketplaceService.getAllCardsForSale();
        return ResponseEntity.ok(
                new ApiResponse<>(true, cards, "Marketplace listings fetched successfully.")
        );
    }
}