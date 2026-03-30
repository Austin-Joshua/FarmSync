package com.farmsync.repository;

import com.farmsync.model.Yield;
import com.farmsync.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface YieldRepository extends JpaRepository<Yield, UUID> {
    List<Yield> findByCrop(Crop crop);
    List<Yield> findByCropId(UUID cropId);
}
