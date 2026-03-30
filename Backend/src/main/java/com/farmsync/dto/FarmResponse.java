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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
