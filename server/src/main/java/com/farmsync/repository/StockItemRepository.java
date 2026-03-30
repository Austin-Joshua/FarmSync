package com.farmsync.repository;

import com.farmsync.model.StockItem;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, UUID> {
    List<StockItem> findByUser(User user);
    List<StockItem> findByUserId(UUID userId);
}
