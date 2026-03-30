package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class YieldResponse {
    private UUID id;
    private UUID cropId;
    private String cropName;
    private Double quantity;
    private LocalDate date;
    private String quality;
    private LocalDateTime createdAt;
}
