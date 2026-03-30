package com.farmsync.repository;

import com.farmsync.model.Irrigation;
import com.farmsync.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IrrigationRepository extends JpaRepository<Irrigation, UUID> {
    List<Irrigation> findByCrop(Crop crop);
    List<Irrigation> findByCropId(UUID cropId);
}
