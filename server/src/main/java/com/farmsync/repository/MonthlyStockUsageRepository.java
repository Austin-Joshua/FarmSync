package com.farmsync.repository;

import com.farmsync.model.MonthlyStockUsage;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MonthlyStockUsageRepository extends JpaRepository<MonthlyStockUsage, UUID> {
    List<MonthlyStockUsage> findByUser(User user);
    List<MonthlyStockUsage> findByUserId(UUID userId);
    List<MonthlyStockUsage> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);
}
