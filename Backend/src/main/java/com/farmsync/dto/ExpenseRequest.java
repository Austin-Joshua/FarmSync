package com.farmsync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseRequest {
    @NotBlank(message = "Category is required")
    @Pattern(regexp = "seeds|fertilizers|pesticides|labor|irrigation|equipment|other", message = "Invalid expense category")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotNull(message = "Date is required")
    @PastOrPresent
    private LocalDate date;

    @NotNull(message = "Farm ID is required")
    private UUID farmId;
}
