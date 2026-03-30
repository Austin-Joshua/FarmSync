package com.farmsync.repository;

import com.farmsync.model.CropRecommendation;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CropRecommendationRepository extends JpaRepository<CropRecommendation, UUID> {
    List<CropRecommendation> findByUser(User user);
    List<CropRecommendation> findByUserId(UUID userId);
}
