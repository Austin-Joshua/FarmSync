package com.farmsync.repository;

import com.farmsync.model.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<LoanApplication, UUID> {
    List<LoanApplication> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
}
