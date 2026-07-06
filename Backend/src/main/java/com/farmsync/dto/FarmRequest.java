package com.farmsync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.UUID;

@Data
public class FarmRequest {
    @NotBlank(message = "Farm name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Land size is required")
    @Positive(message = "Land size must be positive")
    private Double landSize;

    private UUID soilTypeId;
    private String soilTypeName;
    private String state;
    private String district;
    private String village;
    private Double latitude;
    private Double longitude;
    private String boundaryCoordinates;
}
