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
        if (!userId.equals(user.getId()) && !"admin".equalsIgnoreCase(user.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized access");
        }
        return stockItemRepository.findByUserId(userId);
    }

    public Optional<StockItem> findById(@org.springframework.lang.NonNull UUID id, User user) {
        StockItem item = com.farmsync.security.OwnershipGuard.requireOwnedStockItem(stockItemRepository, id, user);
        return Optional.of(item);
    }

    @Transactional
    public StockItem createStockItem(StockItem item, User user) {
        item.setUser(user);
        return stockItemRepository.save(item);
    }

    @Transactional
    public StockItem updateStockItem(@org.springframework.lang.NonNull UUID id, StockItem itemDetails, User user) {
        StockItem item = com.farmsync.security.OwnershipGuard.requireOwnedStockItem(stockItemRepository, id, user);

        if (itemDetails.getItemName() != null) item.setItemName(itemDetails.getItemName());
        if (itemDetails.getItemType() != null) item.setItemType(itemDetails.getItemType());
        if (itemDetails.getQuantity() != null) item.setQuantity(itemDetails.getQuantity());
        if (itemDetails.getUnit() != null) item.setUnit(itemDetails.getUnit());

        return stockItemRepository.save(item);
    }

    @Transactional
    public void deleteStockItem(@org.springframework.lang.NonNull UUID id, User user) {
        StockItem item = com.farmsync.security.OwnershipGuard.requireOwnedStockItem(stockItemRepository, id, user);
        stockItemRepository.delete(item);
    }
}
