package com.farmsync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "enable_history_saving")
    private Boolean enableHistorySaving = true;

    @Builder.Default
    @Column(name = "auto_save_stock_records")
    private Boolean autoSaveStockRecords = true;

    @Builder.Default
    @Column(name = "auto_save_income_records")
    private Boolean autoSaveIncomeRecords = true;

    @Builder.Default
    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled = true;

    @Builder.Default
    @Column(length = 20)
    private String theme = "light"; // 'light', 'dark'

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
