package com.farmsync.dto;

import lombok.Data;

@Data
public class DiseaseScanRequest {
    private String cropName;
    private String diseaseName;
    private String severity;
    private Double confidence;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String imageUrl;
    private String notes;
}
