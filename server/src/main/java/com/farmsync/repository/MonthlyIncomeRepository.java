package com.farmsync.repository;

import com.farmsync.model.MonthlyIncome;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyIncomeRepository extends JpaRepository<MonthlyIncome, UUID> {
    List<MonthlyIncome> findByUser(User user);
    List<MonthlyIncome> findByUserId(UUID userId);
    Optional<MonthlyIncome> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);
}
