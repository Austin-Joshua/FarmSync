package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseRequest {
    private String category;
    private String description;
    private Double amount;
    private LocalDate date;
    private UUID farmId;
}
