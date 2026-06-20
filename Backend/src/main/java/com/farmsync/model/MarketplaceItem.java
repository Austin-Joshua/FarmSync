package com.farmsync.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marketplace_items")
public class MarketplaceItem {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private Double quantity;

    @ManyToOne(fetch = FetchType.EAGER)
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

    public MarketplaceItem() {}

    public MarketplaceItem(UUID id, String name, String category, Double price, String unit, Double quantity, User farmer) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.unit = unit;
        this.quantity = quantity;
        this.farmer = farmer;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public User getFarmer() {
        return farmer;
    }

    public void setFarmer(User farmer) {
        this.farmer = farmer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static MarketplaceItemBuilder builder() {
        return new MarketplaceItemBuilder();
    }

    public static class MarketplaceItemBuilder {
        private UUID id;
        private String name;
        private String category;
        private Double price;
        private String unit;
        private Double quantity;
        private User farmer;

        MarketplaceItemBuilder() {}

        public MarketplaceItemBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public MarketplaceItemBuilder name(String name) {
            this.name = name;
            return this;
        }

        public MarketplaceItemBuilder category(String category) {
            this.category = category;
            return this;
        }

        public MarketplaceItemBuilder price(Double price) {
            this.price = price;
            return this;
        }

        public MarketplaceItemBuilder unit(String unit) {
            this.unit = unit;
            return this;
        }

        public MarketplaceItemBuilder quantity(Double quantity) {
            this.quantity = quantity;
            return this;
        }

        public MarketplaceItemBuilder farmer(User farmer) {
            this.farmer = farmer;
            return this;
        }

        public MarketplaceItem build() {
            return new MarketplaceItem(id, name, category, price, unit, quantity, farmer);
        }
    }
}
