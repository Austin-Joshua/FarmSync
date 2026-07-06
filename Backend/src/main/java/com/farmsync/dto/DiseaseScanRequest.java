package com.farmsync.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DiseaseScanRequest {
    @NotBlank(message = "Crop name is required")
    private String cropName;

    @NotBlank(message = "Disease name is required")
    private String diseaseName;

    @Pattern(regexp = "Low|Medium|High|low|medium|high", message = "Invalid severity")
    private String severity;

    @DecimalMin(value = "0.0", message = "Confidence must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Confidence must be between 0 and 1")
    private Double confidence;

    private Double latitude;
    private Double longitude;
    private String locationName;
    private String imageUrl;
    private String notes;
}
