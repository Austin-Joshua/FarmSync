package com.farmsync.service;

import com.farmsync.model.Crop;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CropService {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private FarmService farmService;

    public List<Crop> findByFarmId(@org.springframework.lang.NonNull UUID farmId, User user) {
        Farm farm = farmService.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return cropRepository.findByFarmId(farmId);
    }

    public Optional<Crop> findById(@org.springframework.lang.NonNull UUID id, User user) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop not found"));
        
        // Security check
        if (!crop.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return Optional.of(crop);
    }

    @Transactional
    public Crop createCrop(Crop crop, User user) {
        Farm farm = farmService.findById(java.util.Objects.requireNonNull(crop.getFarm().getId()))
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return cropRepository.save(crop);
    }

    @Transactional
    public Crop updateCrop(@org.springframework.lang.NonNull UUID id, Crop cropDetails, User user) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop not found"));

        // Security check
        if (!crop.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        if (cropDetails.getName() != null) crop.setName(cropDetails.getName());
        if (cropDetails.getSowingDate() != null) crop.setSowingDate(cropDetails.getSowingDate());
        if (cropDetails.getHarvestDate() != null) crop.setHarvestDate(cropDetails.getHarvestDate());
        if (cropDetails.getStatus() != null) crop.setStatus(cropDetails.getStatus());
        if (cropDetails.getSeason() != null) crop.setSeason(cropDetails.getSeason());

        return cropRepository.save(crop);
    }

    @Transactional
    public void deleteCrop(@org.springframework.lang.NonNull UUID id, User user) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop not found"));

        // Security check
        if (!crop.getFarm().getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        cropRepository.delete(crop);
    }
}
