package com.farmsync.repository;

import com.farmsync.model.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, UUID> {
    Optional<CropType> findByName(String name);
}
