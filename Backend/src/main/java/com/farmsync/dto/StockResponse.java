package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StockResponse {
    private UUID id;
    private String itemName;
    private String itemType;
    private Double quantity;
    private String unit;
    private UUID userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Aliases for frontend compatibility
    private String name;
    private String category;
}
