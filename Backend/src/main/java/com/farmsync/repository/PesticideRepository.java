package com.farmsync.repository;

import com.farmsync.model.Pesticide;
import com.farmsync.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PesticideRepository extends JpaRepository<Pesticide, UUID> {
    List<Pesticide> findByCrop(Crop crop);
    List<Pesticide> findByCropId(UUID cropId);
}
