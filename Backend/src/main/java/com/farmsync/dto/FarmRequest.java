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
}
