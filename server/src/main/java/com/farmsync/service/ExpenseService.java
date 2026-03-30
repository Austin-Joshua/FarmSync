package com.farmsync.service;

import com.farmsync.model.Expense;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private FarmService farmService;

    public List<Expense> findByFarmId(UUID farmId, User user) {
        Farm farm = farmService.findById(java.util.Objects.requireNonNull(farmId))
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return expenseRepository.findByFarmId(farmId);
    }

    public Optional<Expense> findById(@org.springframework.lang.NonNull UUID id, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        // Security check
        if (!expense.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return Optional.of(expense);
    }

    @Transactional
    public Expense createExpense(Expense expense, User user) {
        Farm farm = farmService.findById(java.util.Objects.requireNonNull(expense.getFarm().getId()))
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(@org.springframework.lang.NonNull UUID id, Expense expenseDetails, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Security check
        if (!expense.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        if (expenseDetails.getCategory() != null) expense.setCategory(expenseDetails.getCategory());
        if (expenseDetails.getDescription() != null) expense.setDescription(expenseDetails.getDescription());
        if (expenseDetails.getAmount() != null) expense.setAmount(expenseDetails.getAmount());
        if (expenseDetails.getDate() != null) expense.setDate(expenseDetails.getDate());

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(@org.springframework.lang.NonNull UUID id, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Security check
        if (!expense.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        expenseRepository.delete(expense);
    }
}
