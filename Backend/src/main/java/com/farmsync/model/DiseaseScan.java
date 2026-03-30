package com.farmsync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "disease_scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseScan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "crop_name", nullable = false)
    private String cropName;

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @Column(nullable = false)
    private String severity; // 'low', 'medium', 'high', 'critical'

    private Double confidence;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "image_url")
    private String imageUrl;

    private String notes;

    @Column(name = "scanned_at", updatable = false)
    private LocalDateTime scannedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        scannedAt = LocalDateTime.now();
        createdAt = LocalDateTime.now();
    }
}
