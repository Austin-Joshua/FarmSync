package com.farmsync.service;

import com.farmsync.model.Crop;
import com.farmsync.model.Yield;
import com.farmsync.model.User;
import com.farmsync.repository.CropRepository;
import com.farmsync.repository.YieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class YieldService {

    @Autowired
    private YieldRepository yieldRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private CropService cropService;

    public List<Yield> findByCropId(@org.springframework.lang.NonNull UUID cropId, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedCrop(cropRepository, cropId, user);
        return yieldRepository.findByCropId(cropId);
    }

    public List<Yield> findAllByUser(User user) {
        // Get all crops for this user, then collect all their yields
        List<Crop> userCrops = cropService.findAllByUser(user);
        List<Yield> allYields = new ArrayList<>();
        for (Crop crop : userCrops) {
            allYields.addAll(yieldRepository.findByCropId(crop.getId()));
        }
        return allYields;
    }

    public Optional<Yield> findById(@org.springframework.lang.NonNull UUID id, User user) {
        Yield yield = com.farmsync.security.OwnershipGuard.requireOwnedYield(yieldRepository, id, user);
        return Optional.of(yield);
    }

    @Transactional
    public Yield createYield(Yield yield, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedCrop(cropRepository, java.util.Objects.requireNonNull(yield.getCrop().getId()), user);
        return yieldRepository.save(yield);
    }

    @Transactional
    public Yield updateYield(@org.springframework.lang.NonNull UUID id, Yield yieldDetails, User user) {
        Yield yield = com.farmsync.security.OwnershipGuard.requireOwnedYield(yieldRepository, id, user);

        if (yieldDetails.getQuantity() != null) yield.setQuantity(yieldDetails.getQuantity());
        if (yieldDetails.getDate() != null) yield.setDate(yieldDetails.getDate());
        if (yieldDetails.getQuality() != null) yield.setQuality(yieldDetails.getQuality());

        return yieldRepository.save(yield);
    }

    @Transactional
    public void deleteYield(@org.springframework.lang.NonNull UUID id, User user) {
        Yield yield = com.farmsync.security.OwnershipGuard.requireOwnedYield(yieldRepository, id, user);
        yieldRepository.delete(yield);
    }
}
