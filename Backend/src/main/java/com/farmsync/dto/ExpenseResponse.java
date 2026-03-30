package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExpenseResponse {
    private UUID id;
    private String category;
    private String description;
    private Double amount;
    private LocalDate date;
    private UUID farmId;
    private String farmName;
    private LocalDateTime createdAt;
}
