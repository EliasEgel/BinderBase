package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
public class saveCardDto {
    private String cardName;
    private String cardId;
    private String userId;
    private String username;
}
