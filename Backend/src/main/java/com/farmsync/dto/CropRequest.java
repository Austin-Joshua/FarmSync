package com.farmsync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CropRequest {
    @NotBlank(message = "Crop name is required")
    private String name;

    private String cropTypeName;
    private UUID cropTypeId;

    @NotNull(message = "Sowing date is required")
    @PastOrPresent
    private LocalDate sowingDate;

    private LocalDate harvestDate;

    @Pattern(regexp = "active|harvested|failed", message = "Invalid status")
    private String status;

    @NotBlank
    private String season;

    @NotNull
    private UUID farmId;
}
