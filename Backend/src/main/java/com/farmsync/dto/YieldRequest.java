package com.farmsync.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class YieldRequest {
    @NotNull(message = "Crop ID is required")
    private UUID cropId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Date is required")
    @PastOrPresent
    private LocalDate date;

    @Pattern(regexp = "poor|fair|good|excellent", message = "Invalid quality value")
    private String quality;
}
