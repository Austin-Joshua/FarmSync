package com.farmsync.controller;

import com.farmsync.dto.CropRequest;
import com.farmsync.dto.CropResponse;
import com.farmsync.model.Crop;
import com.farmsync.model.User;
import com.farmsync.service.CropService;
import com.farmsync.service.CropTypeService;
import com.farmsync.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @Autowired
    private CropTypeService cropTypeService;

    @Autowired
    private FarmService farmService;

    @GetMapping
    public ResponseEntity<List<CropResponse>> getCrops(
            @RequestParam(required = false) UUID farm_id,
            @AuthenticationPrincipal User user) {
        
        List<Crop> crops;
        if (farm_id != null) {
            crops = cropService.findByFarmId(farm_id, user);
        } else {
            // Ideally, fetch all crops for all farms of the user
            List<UUID> farmIds = farmService.findByFarmerId(user.getId()).stream()
                    .map(f -> f.getId())
                    .collect(Collectors.toList());
            crops = farmIds.stream()
                    .filter(id -> id != null)
                    .flatMap(id -> {
                        if (id == null) return java.util.stream.Stream.empty();
                        List<Crop> farmCrops = cropService.findByFarmId(id, user);
                        return farmCrops.stream();
                    })
                    .collect(Collectors.toList());
        }
        
        List<CropResponse> responses = crops.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CropResponse> getCrop(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        Crop crop = cropService.findById(id, user)
                .orElseThrow(() -> new RuntimeException("Crop not found"));
        return ResponseEntity.ok(convertToResponse(crop));
    }

    @PostMapping
    public ResponseEntity<CropResponse> createCrop(@RequestBody CropRequest request, @AuthenticationPrincipal User user) {
        Crop crop = Crop.builder()
                .name(request.getName())
                .season(request.getSeason())
                .sowingDate(request.getSowingDate())
                .harvestDate(request.getHarvestDate())
                .status(request.getStatus())
                .farm(farmService.findById(java.util.Objects.requireNonNull(request.getFarmId())).orElseThrow(() -> new RuntimeException("Farm not found")))
                .build();
        
        if (request.getCropTypeId() != null) {
            final UUID cropTypeId = request.getCropTypeId();
            if (cropTypeId != null) {
                crop.setCropType(cropTypeService.findById(cropTypeId).orElse(null));
            }
        }

        Crop savedCrop = cropService.createCrop(crop, user);
        return ResponseEntity.status(201).body(convertToResponse(savedCrop));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CropResponse> updateCrop(@PathVariable @org.springframework.lang.NonNull UUID id, @RequestBody CropRequest request, @AuthenticationPrincipal User user) {
        Crop cropDetails = Crop.builder()
                .name(request.getName())
                .season(request.getSeason())
                .sowingDate(request.getSowingDate())
                .harvestDate(request.getHarvestDate())
                .status(request.getStatus())
                .build();

        Crop updatedCrop = cropService.updateCrop(java.util.Objects.requireNonNull(id), cropDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedCrop));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        cropService.deleteCrop(java.util.Objects.requireNonNull(id), user);
        return ResponseEntity.noContent().build();
    }

    private CropResponse convertToResponse(Crop crop) {
        CropResponse response = new CropResponse();
        response.setId(crop.getId());
        response.setName(crop.getName());
        response.setSeason(crop.getSeason());
        response.setSowingDate(crop.getSowingDate());
        response.setHarvestDate(crop.getHarvestDate());
        response.setStatus(crop.getStatus());
        response.setFarmId(crop.getFarm().getId());
        if (crop.getCropType() != null) {
            response.setCropTypeId(crop.getCropType().getId());
            response.setCropTypeName(crop.getCropType().getName());
        }
        response.setCreatedAt(crop.getCreatedAt());
        response.setUpdatedAt(crop.getUpdatedAt());
        return response;
    }
}
