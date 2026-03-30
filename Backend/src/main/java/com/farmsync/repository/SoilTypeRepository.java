package com.farmsync.repository;

import com.farmsync.model.SoilType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SoilTypeRepository extends JpaRepository<SoilType, UUID> {
    Optional<SoilType> findByName(String name);
}
