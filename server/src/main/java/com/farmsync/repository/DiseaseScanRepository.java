package com.farmsync.repository;

import com.farmsync.model.DiseaseScan;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiseaseScanRepository extends JpaRepository<DiseaseScan, UUID> {
    List<DiseaseScan> findByUser(User user);
    List<DiseaseScan> findByUserId(UUID userId);
}
