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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @Autowired
    private FarmService farmService;

    @Autowired
    private CropTypeService cropTypeService;

    private Map<String, Object> cropToMap(Crop crop) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", crop.getId());
        map.put("name", crop.getName());
        map.put("status", crop.getStatus());
        map.put("season", crop.getSeason());
        map.put("sowingDate", crop.getSowingDate());
        map.put("harvestDate", crop.getHarvestDate());
        map.put("farmId", crop.getFarm() != null ? crop.getFarm().getId() : null);
        map.put("farmName", crop.getFarm() != null ? crop.getFarm().getName() : null);
        map.put("category", crop.getCropType() != null ? crop.getCropType().getCategory() : null);
        map.put("cropType", crop.getCropType() != null ? crop.getCropType().getName() : null);
        map.put("createdAt", crop.getCreatedAt());
        return map;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCrop(@RequestBody CropRequest request, @AuthenticationPrincipal User user) {
        Crop crop = Crop.builder()
                .name(request.getName())
                .sowingDate(request.getSowingDate())
                .harvestDate(request.getHarvestDate())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .season(request.getSeason())
                .farm(farmService.findById(request.getFarmId()).orElseThrow(() -> new RuntimeException("Farm not found")))
                .build();
        
        if (request.getCropTypeId() != null) {
            crop.setCropType(cropTypeService.findById(request.getCropTypeId()).orElse(null));
        } else if (request.getCropTypeName() != null) {
            crop.setCropType(cropTypeService.findByName(request.getCropTypeName()).orElse(null));
        }

        Crop savedCrop = cropService.createCrop(crop, user);
        return ResponseEntity.status(201).body(cropToMap(savedCrop));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCrops(
            @RequestParam(required = false) UUID farmId,
            @AuthenticationPrincipal User user) {
        List<Crop> crops;
        if (farmId != null) {
            crops = cropService.findByFarmId(farmId, user);
        } else {
            crops = cropService.findAllByUser(user);
        }
        List<Map<String, Object>> result = crops.stream()
                .map(this::cropToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
