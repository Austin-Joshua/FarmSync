package com.farmsync.controller;

import com.farmsync.model.*;
import com.farmsync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/admin/statistics")
public class AnalyticsController {

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private YieldRepository yieldRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAdminStatistics(@AuthenticationPrincipal User user) {
        // Analytics aggregation logic for the authenticated user
        List<Farm> farms = farmRepository.findByFarmer(user);
        
        long totalCrops = 0;
        double totalExpenses = 0.0;
        double totalYieldQuantity = 0.0;
        
        for (Farm farm : farms) {
            List<Crop> crops = cropRepository.findByFarm(farm);
            totalCrops += crops.size();
            
            List<Expense> expenses = expenseRepository.findByFarm(farm);
            totalExpenses += expenses.stream().mapToDouble(Expense::getAmount).sum();
            
            for (Crop crop : crops) {
                List<Yield> yields = yieldRepository.findByCrop(crop);
                totalYieldQuantity += yields.stream().mapToDouble(Yield::getQuantity).sum();
            }
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFarms", farms.size());
        stats.put("totalCrops", totalCrops);
        stats.put("totalExpenses", totalExpenses);
        stats.put("totalYield", totalYieldQuantity);
        stats.put("activeAlerts", 2); // Mocked for UI feedback
        stats.put("revenue", totalYieldQuantity * 45.5); // Simplified calculation
        stats.put("updatedAt", System.currentTimeMillis());
        
        return ResponseEntity.ok(stats);
    }
}
