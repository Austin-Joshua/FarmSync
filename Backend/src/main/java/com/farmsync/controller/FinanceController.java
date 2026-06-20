package com.farmsync.controller;

import com.farmsync.model.LoanApplication;
import com.farmsync.model.User;
import com.farmsync.repository.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private LoanRepository loanRepository;

    @GetMapping("/loans")
    public ResponseEntity<List<LoanApplication>> getLoans(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loanRepository.findByFarmerIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/loans")
    public ResponseEntity<LoanApplication> applyForLoan(@AuthenticationPrincipal User user, @RequestBody LoanApplication loan) {
        loan.setFarmer(user);
        loan.setStatus("PENDING");
        // Simulated default rates for demo
        if (loan.getInterestRate() == null) loan.setInterestRate(7.5);
        if (loan.getTermMonths() == null) loan.setTermMonths(24);
        return ResponseEntity.ok(loanRepository.save(loan));
    }

    @GetMapping("/projections")
    public ResponseEntity<Map<String, Object>> getProfitLossProjections(@AuthenticationPrincipal User user) {
        // In a real system, this would aggregate actual Expenses and Yields.
        // For demonstration of the feature, we return simulated projections based on typical farm metrics.
        Map<String, Object> projections = new HashMap<>();
        projections.put("projectedRevenue", 450000.0);
        projections.put("projectedExpenses", 120000.0);
        projections.put("projectedProfit", 330000.0);
        projections.put("profitMargin", 73.3);
        projections.put("riskFactor", "LOW");
        return ResponseEntity.ok(projections);
    }
}
