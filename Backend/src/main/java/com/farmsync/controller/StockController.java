package com.farmsync.controller;

import com.farmsync.dto.StockRequest;
import com.farmsync.dto.StockResponse;
import com.farmsync.model.StockItem;
import com.farmsync.model.User;
import com.farmsync.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    public ResponseEntity<List<StockResponse>> getStockItems(@AuthenticationPrincipal User user) {
        List<StockItem> items = stockService.findByUserId(user.getId(), user);
        List<StockResponse> responses = items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockResponse> getStockItem(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        StockItem item = stockService.findById(id, user)
                .orElseThrow(() -> new RuntimeException("Stock item not found"));
        return ResponseEntity.ok(convertToResponse(item));
    }

    @PostMapping
    public ResponseEntity<StockResponse> createStockItem(@RequestBody StockRequest request, @AuthenticationPrincipal User user) {
        StockItem item = StockItem.builder()
                .itemName(request.getItemName())
                .itemType(request.getItemType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .user(user)
                .build();
        
        StockItem savedItem = stockService.createStockItem(item, user);
        return ResponseEntity.status(201).body(convertToResponse(savedItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockResponse> updateStockItem(@PathVariable @org.springframework.lang.NonNull UUID id, @RequestBody StockRequest request, @AuthenticationPrincipal User user) {
        StockItem itemDetails = StockItem.builder()
                .itemName(request.getItemName())
                .itemType(request.getItemType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .build();

        StockItem updatedItem = stockService.updateStockItem(id, itemDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStockItem(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        stockService.deleteStockItem(id, user);
        return ResponseEntity.noContent().build();
    }

    private StockResponse convertToResponse(StockItem item) {
        StockResponse response = new StockResponse();
        response.setId(item.getId());
        response.setItemName(item.getItemName());
        response.setItemType(item.getItemType());
        response.setQuantity(item.getQuantity());
        response.setUnit(item.getUnit());
        response.setUserId(item.getUser().getId());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
