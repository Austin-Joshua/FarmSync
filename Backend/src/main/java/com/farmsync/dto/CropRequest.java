package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CropRequest {
    private String name;
    private String cropTypeName;
    private UUID cropTypeId;
    private LocalDate sowingDate;
    private LocalDate harvestDate;
    private String status;
    private UUID farmId;
}
