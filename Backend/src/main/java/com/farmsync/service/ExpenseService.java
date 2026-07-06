package com.farmsync.service;

import com.farmsync.model.Expense;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.ExpenseRepository;
import com.farmsync.repository.FarmRepository;
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
    private FarmRepository farmRepository;

    public List<Expense> findByFarmId(UUID farmId, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedFarm(farmRepository, farmId, user);
        return expenseRepository.findByFarmId(farmId);
    }

    public Optional<Expense> findById(@org.springframework.lang.NonNull UUID id, User user) {
        Expense expense = com.farmsync.security.OwnershipGuard.requireOwnedExpense(expenseRepository, id, user);
        return Optional.of(expense);
    }

    @Transactional
    public Expense createExpense(Expense expense, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedFarm(farmRepository, java.util.Objects.requireNonNull(expense.getFarm().getId()), user);
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(@org.springframework.lang.NonNull UUID id, Expense expenseDetails, User user) {
        Expense expense = com.farmsync.security.OwnershipGuard.requireOwnedExpense(expenseRepository, id, user);

        if (expenseDetails.getCategory() != null) expense.setCategory(expenseDetails.getCategory());
        if (expenseDetails.getDescription() != null) expense.setDescription(expenseDetails.getDescription());
        if (expenseDetails.getAmount() != null) expense.setAmount(expenseDetails.getAmount());
        if (expenseDetails.getDate() != null) expense.setDate(expenseDetails.getDate());

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(@org.springframework.lang.NonNull UUID id, User user) {
        Expense expense = com.farmsync.security.OwnershipGuard.requireOwnedExpense(expenseRepository, id, user);
        expenseRepository.delete(expense);
    }
}
