package com.farmsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "crop_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String season; // 'kharif', 'rabi', 'zaid', 'year-round'

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "suitable_soil_types", columnDefinition = "jsonb")
    private List<String> suitableSoilTypes;

    @Column(name = "average_yield")
    private Double averageYield;

    @Column(name = "growth_period")
    private Integer growthPeriod;

    @Column(name = "water_requirement")
    private String waterRequirement; // 'low', 'medium', 'high'

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

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
