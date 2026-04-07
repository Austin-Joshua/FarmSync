package com.farmsync.controller;

import com.farmsync.dto.CropRequest;
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

@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @Autowired
    private FarmService farmService;

    @Autowired
    private CropTypeService cropTypeService;

    @PostMapping
    public ResponseEntity<Crop> createCrop(@RequestBody CropRequest request, @AuthenticationPrincipal User user) {
        Crop crop = Crop.builder()
                .name(request.getName())
                .sowingDate(request.getSowingDate())
                .harvestDate(request.getHarvestDate())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .farm(farmService.findById(request.getFarmId()).orElseThrow(() -> new RuntimeException("Farm not found")))
                .build();
        
        if (request.getCropTypeId() != null) {
            crop.setCropType(cropTypeService.findById(request.getCropTypeId()).orElse(null));
        } else if (request.getCropTypeName() != null) {
            crop.setCropType(cropTypeService.findByName(request.getCropTypeName()).orElse(null));
        }

        Crop savedCrop = cropService.createCrop(crop, user);
        return ResponseEntity.status(201).body(savedCrop);
    }

    @GetMapping
    public ResponseEntity<List<Crop>> getCropsByFarm(@RequestParam UUID farmId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cropService.findByFarmId(farmId, user));
    }
}
