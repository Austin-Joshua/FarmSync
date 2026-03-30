package com.farmsync.repository;

import com.farmsync.model.Farm;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FarmRepository extends JpaRepository<Farm, UUID> {
    List<Farm> findByFarmer(User farmer);
    List<Farm> findByFarmerId(UUID farmerId);
}
