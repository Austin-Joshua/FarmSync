package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CropRequest {
    private String name;
    private UUID cropTypeId;
    private String season;
    private LocalDate sowingDate;
    private LocalDate harvestDate;
    private String status; // 'active', 'harvested', 'planned'
    private UUID farmId;
}
