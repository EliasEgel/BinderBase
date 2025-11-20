package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.UserDto;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Gets a list of all users available for chat.
     * Assumes you have Spring Security configured to resolve the JWT.
     *
     * @param principal The authenticated user's JWT principal.
     * @return A list of UserDto objects.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(@AuthenticationPrincipal Jwt principal) {
        // The 'subject' of the JWT from Clerk is the user's Clerk ID
        String clerkUserId = principal.getSubject();

        List<UserDto> users = userService.getAllChatUsers(clerkUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, users, "Users fetched successfully.")
        );
    }
    @GetMapping("/chat-partners") // New specific endpoint
    public ResponseEntity<ApiResponse<List<UserDto>>> getChatPartners(@AuthenticationPrincipal Jwt principal) {
        String clerkUserId = principal.getSubject();
        List<UserDto> users = userService.getUsersWithChatHistory(clerkUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, users, "Chat partners fetched.")
        );
    }
}
