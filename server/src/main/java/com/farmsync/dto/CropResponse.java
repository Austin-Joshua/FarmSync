package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CropResponse {
    private UUID id;
    private String name;
    private UUID cropTypeId;
    private String cropTypeName;
    private String season;
    private LocalDate sowingDate;
    private LocalDate harvestDate;
    private String status; // 'active', 'harvested', 'planned'
    private UUID farmId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
