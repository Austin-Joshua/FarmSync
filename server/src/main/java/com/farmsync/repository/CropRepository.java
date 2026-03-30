package com.farmsync.repository;

import com.farmsync.model.Crop;
import com.farmsync.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CropRepository extends JpaRepository<Crop, UUID> {
    List<Crop> findByFarm(Farm farm);
    List<Crop> findByFarmId(UUID farmId);
}
