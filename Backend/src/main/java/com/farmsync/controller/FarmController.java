package com.farmsync.controller;

import com.farmsync.dto.FarmRequest;
import com.farmsync.dto.FarmResponse;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.service.FarmService;
import com.farmsync.service.SoilTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/farms")
public class FarmController {

    @Autowired
    private FarmService farmService;

    @Autowired
    private SoilTypeService soilTypeService;

    @GetMapping
    public ResponseEntity<List<FarmResponse>> getFarms(@AuthenticationPrincipal User user) {
        List<Farm> farms = farmService.findByFarmerId(user.getId());
        List<FarmResponse> responses = farms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getFarm(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        Farm farm = farmService.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        // Security check
        if (!farm.getFarmer().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(convertToResponse(farm));
    }

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(@Valid @RequestBody FarmRequest request, @AuthenticationPrincipal User user) {
        Farm farm = Farm.builder()
                .name(request.getName())
                .location(request.getLocation())
                .landSize(request.getLandSize())
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .boundaryCoordinates(request.getBoundaryCoordinates())
                .farmer(user)
                .build();
        
        if (request.getSoilTypeId() != null) {
            UUID soilTypeId = request.getSoilTypeId();
            farm.setSoilType(soilTypeService.findById(java.util.Objects.requireNonNull(soilTypeId)).orElse(null));
        } else if (request.getSoilTypeName() != null) {
            farm.setSoilType(soilTypeService.findByName(request.getSoilTypeName()).orElse(null));
        }

        Farm savedFarm = farmService.createFarm(farm);
        return ResponseEntity.status(201).body(convertToResponse(savedFarm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FarmResponse> updateFarm(@PathVariable @org.springframework.lang.NonNull UUID id, @Valid @RequestBody FarmRequest request, @AuthenticationPrincipal User user) {
        Farm farmDetails = Farm.builder()
                .name(request.getName())
                .location(request.getLocation())
                .landSize(request.getLandSize())
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .boundaryCoordinates(request.getBoundaryCoordinates())
                .build();
        
        if (request.getSoilTypeId() != null) {
            UUID soilTypeId = request.getSoilTypeId();
            farmDetails.setSoilType(soilTypeService.findById(java.util.Objects.requireNonNull(soilTypeId)).orElse(null));
        }

        Farm updatedFarm = farmService.updateFarm(id, farmDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedFarm));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        farmService.deleteFarm(id, user);
        return ResponseEntity.noContent().build();
    }

    private FarmResponse convertToResponse(Farm farm) {
        FarmResponse response = new FarmResponse();
        response.setId(farm.getId());
        response.setName(farm.getName());
        response.setLocation(farm.getLocation());
        response.setLandSize(farm.getLandSize());
        response.setFarmerId(farm.getFarmer().getId());
        response.setState(farm.getState());
        response.setDistrict(farm.getDistrict());
        response.setVillage(farm.getVillage());
        response.setLatitude(farm.getLatitude());
        response.setLongitude(farm.getLongitude());
        response.setBoundaryCoordinates(farm.getBoundaryCoordinates());
        if (farm.getSoilType() != null) {
            response.setSoilTypeId(farm.getSoilType().getId());
            response.setSoilTypeName(farm.getSoilType().getName());
        }
        response.setCreatedAt(farm.getCreatedAt());
        response.setUpdatedAt(farm.getUpdatedAt());
        return response;
    }
}
