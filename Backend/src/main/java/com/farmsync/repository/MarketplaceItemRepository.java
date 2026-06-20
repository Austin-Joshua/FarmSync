package com.farmsync.repository;

import com.farmsync.model.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, UUID> {
    List<MarketplaceItem> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
    List<MarketplaceItem> findByNameIgnoreCase(String name);
    List<MarketplaceItem> findByCategoryIgnoreCase(String category);
}
