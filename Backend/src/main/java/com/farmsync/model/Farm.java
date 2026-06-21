package com.farmsync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private String state;

    private String district;

    private String village;

    private Double latitude;

    private Double longitude;

    @Column(name = "boundary_coordinates", columnDefinition = "TEXT")
    private String boundaryCoordinates; // JSON polygon coordinates array [[lat,lng],...]

    @Column(name = "land_size", nullable = false)
    private Double landSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soil_type_id")
    private SoilType soilType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
