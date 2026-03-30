package com.farmsync.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String role;
    private String location;
    private Double landSize;
    private String soilType;
    private String pictureUrl;
}
