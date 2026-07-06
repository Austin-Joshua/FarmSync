package com.farmsync.controller;

import com.farmsync.model.User;
import com.farmsync.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIDetectionController {

    @Autowired
    private AIService aiService;

    @PostMapping("/disease-detect")
    public ResponseEntity<Map<String, Object>> detectDisease(
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal User user) {
        try {
            Map<String, Object> result = aiService.detectDisease(image, user).block();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "AI Detection Failed: " + e.getMessage()));
        }
    }
}
