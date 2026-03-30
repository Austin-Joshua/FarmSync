package com.farmsync.controller;

import com.farmsync.dto.YieldRequest;
import com.farmsync.dto.YieldResponse;
import com.farmsync.model.Yield;
import com.farmsync.model.User;
import com.farmsync.service.YieldService;
import com.farmsync.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/yields")
public class YieldController {

    @Autowired
    private YieldService yieldService;

    @Autowired
    private CropService cropService;

    @GetMapping
    public ResponseEntity<List<YieldResponse>> getYields(
            @RequestParam(required = false) UUID cropId,
            @AuthenticationPrincipal User user) {
        
        List<Yield> yields;
        if (cropId != null) {
            yields = yieldService.findByCropId(cropId, user);
        } else {
            // Ideally, fetch all yields for all crops for all farms of the user
            // To simplify, we'll return an empty list if cropId is not provided
            // or fetch all crops first. For now, let's just use cropId as required in practice.
            return ResponseEntity.ok(List.of());
        }
        
        List<YieldResponse> responses = yields.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<YieldResponse> getYield(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        final UUID safeId = java.util.Objects.requireNonNull(id);
        Yield yield = yieldService.findById(safeId, user)
                .orElseThrow(() -> new RuntimeException("Yield not found"));
        return ResponseEntity.ok(convertToResponse(yield));
    }

    @PostMapping
    public ResponseEntity<YieldResponse> createYield(@RequestBody YieldRequest request, @AuthenticationPrincipal User user) {
        final UUID cropId = request.getCropId();
        if (cropId == null) {
            throw new RuntimeException("Crop ID is required");
        }
        
        Yield yield = Yield.builder()
                .quantity(request.getQuantity())
                .date(request.getDate())
                .quality(request.getQuality())
                .crop(cropService.findById(cropId, user).orElseThrow(() -> new RuntimeException("Crop not found")))
                .build();
        
        Yield savedYield = yieldService.createYield(yield, user);
        return ResponseEntity.status(201).body(convertToResponse(savedYield));
    }

    @PutMapping("/{id}")
    public ResponseEntity<YieldResponse> updateYield(@PathVariable @org.springframework.lang.NonNull UUID id, @RequestBody YieldRequest request, @AuthenticationPrincipal User user) {
        Yield yieldDetails = Yield.builder()
                .quantity(request.getQuantity())
                .date(request.getDate())
                .quality(request.getQuality())
                .build();

        Yield updatedYield = yieldService.updateYield(id, yieldDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedYield));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteYield(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        yieldService.deleteYield(id, user);
        return ResponseEntity.noContent().build();
    }

    private YieldResponse convertToResponse(Yield yield) {
        YieldResponse response = new YieldResponse();
        response.setId(yield.getId());
        response.setQuantity(yield.getQuantity());
        response.setDate(yield.getDate());
        response.setQuality(yield.getQuality());
        response.setCropId(yield.getCrop().getId());
        response.setCropName(yield.getCrop().getName());
        response.setCreatedAt(yield.getCreatedAt());
        return response;
    }
}
