package com.farmsync.service;

import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.FarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FarmService {

    @Autowired
    private FarmRepository farmRepository;

    public List<Farm> findByFarmer(User farmer) {
        return farmRepository.findByFarmer(farmer);
    }

    public List<Farm> findByFarmerId(UUID farmerId) {
        return farmRepository.findByFarmerId(farmerId);
    }

    public Optional<Farm> findById(@org.springframework.lang.NonNull UUID id) {
        return farmRepository.findById(id);
    }

    @Transactional
    public Farm createFarm(Farm farm) {
        return farmRepository.save(java.util.Objects.requireNonNull(farm));
    }

    @Transactional
    public Farm updateFarm(@org.springframework.lang.NonNull UUID id, Farm farmDetails, User user) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        // Security check: Only owner or admin can update
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        if (farmDetails.getName() != null) farm.setName(farmDetails.getName());
        if (farmDetails.getLocation() != null) farm.setLocation(farmDetails.getLocation());
        if (farmDetails.getLandSize() != null) farm.setLandSize(farmDetails.getLandSize());
        if (farmDetails.getSoilType() != null) farm.setSoilType(farmDetails.getSoilType());

        return farmRepository.save(farm);
    }

    @Transactional
    public void deleteFarm(@org.springframework.lang.NonNull UUID id, User user) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        farmRepository.delete(farm);
    }
}
