package com.farmsync.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; // 'farmer' or 'admin'

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String phone;

    private String location;

    @Column(name = "land_size")
    private Double landSize;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "fcm_token")
    private String fcmToken;

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

    // Default constructor
    public User() {}

    // All-args constructor
    public User(UUID id, String name, String email, String role, String password, String phone, String location, Double landSize, String soilType, String pictureUrl, String fcmToken, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.password = password;
        this.phone = phone;
        this.location = location;
        this.landSize = landSize;
        this.soilType = soilType;
        this.pictureUrl = pictureUrl;
        this.fcmToken = fcmToken;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLandSize() { return landSize; }
    public void setLandSize(Double landSize) { this.landSize = landSize; }

    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern implementation
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private String password;
        private String phone;
        private String location;
        private Double landSize;
        private String soilType;
        private String pictureUrl;
        private String fcmToken;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        UserBuilder() {}

        public UserBuilder id(UUID id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder location(String location) { this.location = location; return this; }
        public UserBuilder landSize(Double landSize) { this.landSize = landSize; return this; }
        public UserBuilder soilType(String soilType) { this.soilType = soilType; return this; }
        public UserBuilder pictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; return this; }
        public UserBuilder fcmToken(String fcmToken) { this.fcmToken = fcmToken; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, name, email, role, password, phone, location, landSize, soilType, pictureUrl, fcmToken, createdAt, updatedAt);
        }
    }
}
