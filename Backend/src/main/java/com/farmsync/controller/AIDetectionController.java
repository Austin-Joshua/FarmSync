package com.farmsync.controller;

import com.farmsync.model.User;
import com.farmsync.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIDetectionController {

    @Autowired
    private AIService aiService;

    @PostMapping("/disease-detect")
    public Mono<ResponseEntity<Map<String, Object>>> detectDisease(
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal User user) {
        
        return aiService.detectDisease(image, user)
                .map(result -> ResponseEntity.ok(result))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                        .body(Map.of("error", "AI Detection Failed: " + e.getMessage()))));
    }
}
