package com.farmsync.service;

import com.farmsync.model.CropType;
import com.farmsync.model.User;
import com.farmsync.repository.CropTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CropTypeService {

    @Autowired
    private CropTypeRepository cropTypeRepository;

    public List<CropType> findAll() {
        return cropTypeRepository.findAll();
    }

    public Optional<CropType> findById(@org.springframework.lang.NonNull UUID id) {
        return cropTypeRepository.findById(id);
    }

    public Optional<CropType> findByName(String name) {
        return cropTypeRepository.findByName(name);
    }

    @Transactional
    public CropType createCropType(CropType cropType, User admin) {
        if (!admin.getRole().equals("admin")) {
            throw new RuntimeException("Only admins can create crop types");
        }
        cropType.setCreatedBy(admin);
        return cropTypeRepository.save(cropType);
    }

    @Transactional
    public CropType updateCropType(@org.springframework.lang.NonNull UUID id, CropType cropTypeDetails, User admin) {
        if (!admin.getRole().equals("admin")) {
            throw new RuntimeException("Only admins can update crop types");
        }
        CropType cropType = cropTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop type not found"));

        if (cropTypeDetails.getName() != null) cropType.setName(cropTypeDetails.getName());
        if (cropTypeDetails.getCategory() != null) cropType.setCategory(cropTypeDetails.getCategory());
        if (cropTypeDetails.getSeason() != null) cropType.setSeason(cropTypeDetails.getSeason());
        if (cropTypeDetails.getSuitableSoilTypes() != null) cropType.setSuitableSoilTypes(cropTypeDetails.getSuitableSoilTypes());
        if (cropTypeDetails.getAverageYield() != null) cropType.setAverageYield(cropTypeDetails.getAverageYield());
        if (cropTypeDetails.getGrowthPeriod() != null) cropType.setGrowthPeriod(cropTypeDetails.getGrowthPeriod());
        if (cropTypeDetails.getWaterRequirement() != null) cropType.setWaterRequirement(cropTypeDetails.getWaterRequirement());
        if (cropTypeDetails.getDescription() != null) cropType.setDescription(cropTypeDetails.getDescription());

        return cropTypeRepository.save(java.util.Objects.requireNonNull(cropType));
    }

    @Transactional
    public void deleteCropType(@org.springframework.lang.NonNull UUID id, User admin) {
        if (!admin.getRole().equals("admin")) {
            throw new RuntimeException("Only admins can delete crop types");
        }
        cropTypeRepository.deleteById(id);
    }
}
