package com.farmsync.service;

import com.farmsync.model.StockItem;
import com.farmsync.model.User;
import com.farmsync.repository.StockItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StockService {

    @Autowired
    private StockItemRepository stockItemRepository;

    public List<StockItem> findByUserId(UUID userId, User user) {
        // Security check
        if (!userId.equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        return stockItemRepository.findByUserId(userId);
    }

    public Optional<StockItem> findById(@org.springframework.lang.NonNull UUID id, User user) {
        StockItem item = stockItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock item not found"));
        
        // Security check
        if (!item.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return Optional.of(item);
    }

    @Transactional
    public StockItem createStockItem(StockItem item, User user) {
        // Ensure user is set to current user
        item.setUser(user);
        return stockItemRepository.save(item);
    }

    @Transactional
    public StockItem updateStockItem(@org.springframework.lang.NonNull UUID id, StockItem itemDetails, User user) {
        StockItem item = stockItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock item not found"));

        // Security check
        if (!item.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        if (itemDetails.getItemName() != null) item.setItemName(itemDetails.getItemName());
        if (itemDetails.getItemType() != null) item.setItemType(itemDetails.getItemType());
        if (itemDetails.getQuantity() != null) item.setQuantity(itemDetails.getQuantity());
        if (itemDetails.getUnit() != null) item.setUnit(itemDetails.getUnit());

        return stockItemRepository.save(item);
    }

    @Transactional
    public void deleteStockItem(@org.springframework.lang.NonNull UUID id, User user) {
        StockItem item = stockItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock item not found"));

        // Security check
        if (!item.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        stockItemRepository.delete(item);
    }
}
