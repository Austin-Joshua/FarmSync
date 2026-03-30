package com.farmsync.repository;

import com.farmsync.model.Expense;
import com.farmsync.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByFarm(Farm farm);
    List<Expense> findByFarmId(UUID farmId);
}
