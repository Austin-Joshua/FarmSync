package com.farmsync.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class FarmRequest {
    private String name;
    private String location;
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
