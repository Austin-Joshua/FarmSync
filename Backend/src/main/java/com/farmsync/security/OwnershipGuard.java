package com.farmsync.security;

import com.farmsync.model.*;
import com.farmsync.repository.*;
import org.springframework.security.access.AccessDeniedException;
import java.util.UUID;

public class OwnershipGuard {

    private static boolean isAdmin(User user) {
        return user != null && "admin".equalsIgnoreCase(user.getRole());
    }

    public static Farm requireOwnedFarm(FarmRepository repo, UUID id, User user) {
        Farm farm = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getFarmer().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return farm;
    }

    public static Crop requireOwnedCrop(CropRepository repo, UUID id, User user) {
        Crop crop = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop not found"));
        if (!crop.getFarm().getFarmer().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return crop;
    }

    public static Expense requireOwnedExpense(ExpenseRepository repo, UUID id, User user) {
        Expense expense = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getFarm().getFarmer().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return expense;
    }

    public static StockItem requireOwnedStockItem(StockItemRepository repo, UUID id, User user) {
        StockItem item = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock item not found"));
        if (!item.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return item;
    }

    public static Yield requireOwnedYield(YieldRepository repo, UUID id, User user) {
        Yield yield = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Yield record not found"));
        if (!yield.getCrop().getFarm().getFarmer().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return yield;
    }

    public static DiseaseScan requireOwnedDiseaseScan(DiseaseScanRepository repo, UUID id, User user) {
        DiseaseScan scan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Disease scan not found"));
        if (!scan.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Unauthorized access");
        }
        return scan;
    }
}
