package com.farmsync.controller;

import com.farmsync.dto.ExpenseRequest;
import com.farmsync.dto.ExpenseResponse;
import com.farmsync.model.Expense;
import com.farmsync.model.User;
import com.farmsync.service.ExpenseService;
import com.farmsync.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private FarmService farmService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) UUID farmId,
            @AuthenticationPrincipal User user) {
        
        List<Expense> expenses;
        if (farmId != null) {
            expenses = expenseService.findByFarmId(farmId, user);
        } else {
            List<UUID> farmIds = farmService.findByFarmerId(user.getId()).stream()
                    .map(f -> f.getId())
                    .collect(Collectors.toList());
            expenses = farmIds.stream()
                    .flatMap(id -> expenseService.findByFarmId(id, user).stream())
                    .collect(Collectors.toList());
        }
        
        List<ExpenseResponse> responses = expenses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpense(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        Expense expense = expenseService.findById(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return ResponseEntity.ok(convertToResponse(expense));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@RequestBody ExpenseRequest request, @AuthenticationPrincipal User user) {
        Expense expense = Expense.builder()
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .farm(farmService.findById(java.util.Objects.requireNonNull(request.getFarmId())).orElseThrow(() -> new RuntimeException("Farm not found")))
                .build();
        
        Expense savedExpense = expenseService.createExpense(expense, user);
        return ResponseEntity.status(201).body(convertToResponse(savedExpense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable @org.springframework.lang.NonNull UUID id, @RequestBody ExpenseRequest request, @AuthenticationPrincipal User user) {
        Expense expenseDetails = Expense.builder()
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .build();

        Expense updatedExpense = expenseService.updateExpense(id, expenseDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedExpense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        expenseService.deleteExpense(id, user);
        return ResponseEntity.noContent().build();
    }

    private ExpenseResponse convertToResponse(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setCategory(expense.getCategory());
        response.setDescription(expense.getDescription());
        response.setAmount(expense.getAmount());
        response.setDate(expense.getDate());
        response.setFarmId(expense.getFarm().getId());
        response.setFarmName(expense.getFarm().getName());
        response.setCreatedAt(expense.getCreatedAt());
        return response;
    }
}
