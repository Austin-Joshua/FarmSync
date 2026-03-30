package com.farmsync.repository;

import com.farmsync.model.UserSettings;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {
    Optional<UserSettings> findByUser(User user);
    Optional<UserSettings> findByUserId(UUID userId);
}
