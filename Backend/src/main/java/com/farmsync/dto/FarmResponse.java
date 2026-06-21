package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FarmResponse {
    private UUID id;
    private String name;
    private String location;
    private Double landSize;
    private UUID soilTypeId;
    private String soilTypeName;
    private UUID farmerId;
    private String state;
    private String district;
    private String village;
    private Double latitude;
    private Double longitude;
    private String boundaryCoordinates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
