package com.farmsync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "irrigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Irrigation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String method; // 'drip', 'manual', 'sprinkler'

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
