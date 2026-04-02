package com.farmsync.controller;

import com.farmsync.model.User;
import com.farmsync.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public Mono<ResponseEntity<Map<String, String>>> chat(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return aiService.getChatbotResponse(message, user)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                        .body(Map.of("error", "AI Response Failed: " + e.getMessage()))));
    }
}
