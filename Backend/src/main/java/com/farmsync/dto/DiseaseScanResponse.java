package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DiseaseScanResponse {
    private UUID id;
    private String cropName;
    private String diseaseName;
    private String severity;
    private Double confidence;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String imageUrl;
    private String notes;
    private LocalDateTime scannedAt;
    private LocalDateTime createdAt;
}
