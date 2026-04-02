package com.farmsync.service;

import com.farmsync.model.DiseaseScan;
import com.farmsync.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private DiseaseScanService diseaseScanService;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${openai.api.key:}")
    private String openAiKey;

    public Mono<Map<String, Object>> detectDisease(MultipartFile file, User user) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("image", file.getResource());

        return webClientBuilder.build()
                .post()
                .uri(mlServiceUrl + "/ml/disease-detect")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .flatMap(prediction -> {
                    try {
                        // 1. Upload image to Firebase Storage
                        String imageUrl = firebaseService.uploadImage(file, "disease-scans");
                        
                        // 2. Save result to Firestore/DB via DiseaseScanService
                        DiseaseScan scan = DiseaseScan.builder()
                                .cropName("Unknown") // In a real app, user might specify or ML detects
                                .diseaseName((String) prediction.get("disease"))
                                .confidence((Double) prediction.get("confidence"))
                                .severity("Medium") // Default or calculated
                                .imageUrl(imageUrl)
                                .notes((String) prediction.get("solution"))
                                .user(user)
                                .build();
                        
                        diseaseScanService.createDiseaseScan(scan, user);
                        
                        // 3. Send Notification
                        firebaseService.sendPushNotification(
                            user.getFcmToken(), 
                            "Disease Detected!", 
                            "Detection complete for " + prediction.get("disease")
                        );

                        return Mono.just(prediction);
                    } catch (IOException e) {
                        return Mono.error(e);
                    }
                });
    }

    public Mono<Map<String, String>> getChatbotResponse(String userMessage, User user) {
        // Prepare context-aware prompt
        String systemPrompt = "You are FarmSync Assistant, a smart farming expert. " +
                "The user is " + user.getName() + " from " + user.getLocation() + ". " +
                "Provide helpful, concise, and professional farming advice.";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new Object[]{
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        });

        // In a real scenario with a key:
        /*
        return webClientBuilder.build()
                .post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header("Authorization", "Bearer " + openAiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    // Extract response from OpenAI format
                    return Map.of("response", "This is an AI generated response based on OpenAI.");
                });
        */

        // For demo without key, return a smart mock
        String mockResponse = "Based on your location in " + user.getLocation() + 
                ", I recommend focus on irrigation for the upcoming week. " +
                "If you're seeing yellowing leaves, it might be nitrogen deficiency.";
        
        return Mono.just(Map.of("response", mockResponse));
    }
}
