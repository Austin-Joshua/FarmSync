package com.farmsync.repository;

import com.farmsync.model.Fertilizer;
import com.farmsync.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FertilizerRepository extends JpaRepository<Fertilizer, UUID> {
    List<Fertilizer> findByCrop(Crop crop);
    List<Fertilizer> findByCropId(UUID cropId);
}
