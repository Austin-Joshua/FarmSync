package com.farmsync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class StockRequest {
    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Item type is required")
    @Pattern(regexp = "fertilizer|pesticide|seeds|equipment|other", message = "Invalid item type")
    private String itemType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;
}
