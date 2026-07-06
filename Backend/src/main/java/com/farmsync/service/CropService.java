package com.farmsync.service;

import com.farmsync.model.Crop;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.CropRepository;
import com.farmsync.repository.FarmRepository;
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
    private FarmRepository farmRepository;

    public List<Crop> findByFarmId(@org.springframework.lang.NonNull UUID farmId, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedFarm(farmRepository, farmId, user);
        return cropRepository.findByFarmId(farmId);
    }

    public List<Crop> findAllByUser(User user) {
        return cropRepository.findByFarmFarmerId(user.getId());
    }

    public Optional<Crop> findById(@org.springframework.lang.NonNull UUID id, User user) {
        Crop crop = com.farmsync.security.OwnershipGuard.requireOwnedCrop(cropRepository, id, user);
        return Optional.of(crop);
    }

    @Transactional
    public Crop createCrop(Crop crop, User user) {
        com.farmsync.security.OwnershipGuard.requireOwnedFarm(farmRepository, java.util.Objects.requireNonNull(crop.getFarm().getId()), user);
        return cropRepository.save(crop);
    }

    @Transactional
    public Crop updateCrop(@org.springframework.lang.NonNull UUID id, Crop cropDetails, User user) {
        Crop crop = com.farmsync.security.OwnershipGuard.requireOwnedCrop(cropRepository, id, user);

        if (cropDetails.getName() != null) crop.setName(cropDetails.getName());
        if (cropDetails.getSowingDate() != null) crop.setSowingDate(cropDetails.getSowingDate());
        if (cropDetails.getHarvestDate() != null) crop.setHarvestDate(cropDetails.getHarvestDate());
        if (cropDetails.getStatus() != null) crop.setStatus(cropDetails.getStatus());
        if (cropDetails.getSeason() != null) crop.setSeason(cropDetails.getSeason());

        return cropRepository.save(crop);
    }

    @Transactional
    public void deleteCrop(@org.springframework.lang.NonNull UUID id, User user) {
        Crop crop = com.farmsync.security.OwnershipGuard.requireOwnedCrop(cropRepository, id, user);
        cropRepository.delete(crop);
    }
}
