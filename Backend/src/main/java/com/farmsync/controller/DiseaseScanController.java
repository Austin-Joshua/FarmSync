package com.farmsync.controller;

import com.farmsync.dto.DiseaseScanRequest;
import com.farmsync.dto.DiseaseScanResponse;
import com.farmsync.model.DiseaseScan;
import com.farmsync.model.User;
import com.farmsync.service.DiseaseScanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disease")
public class DiseaseScanController {

    @Autowired
    private DiseaseScanService diseaseScanService;

    @GetMapping
    public ResponseEntity<List<DiseaseScanResponse>> getDiseaseScans(@AuthenticationPrincipal User user) {
        List<DiseaseScan> scans = diseaseScanService.findByUserId(user.getId(), user);
        List<DiseaseScanResponse> responses = scans.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiseaseScanResponse> getDiseaseScan(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        DiseaseScan scan = diseaseScanService.findById(id, user)
                .orElseThrow(() -> new RuntimeException("Disease scan not found"));
        return ResponseEntity.ok(convertToResponse(scan));
    }

    @PostMapping
    public ResponseEntity<DiseaseScanResponse> createDiseaseScan(@Valid @RequestBody DiseaseScanRequest request, @AuthenticationPrincipal User user) {
        DiseaseScan scan = DiseaseScan.builder()
                .cropName(request.getCropName())
                .diseaseName(request.getDiseaseName())
                .severity(request.getSeverity())
                .confidence(request.getConfidence())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationName(request.getLocationName())
                .imageUrl(request.getImageUrl())
                .notes(request.getNotes())
                .user(user)
                .build();
        
        DiseaseScan savedScan = diseaseScanService.createDiseaseScan(scan, user);
        return ResponseEntity.status(201).body(convertToResponse(savedScan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiseaseScanResponse> updateDiseaseScan(@PathVariable @org.springframework.lang.NonNull UUID id, @Valid @RequestBody DiseaseScanRequest request, @AuthenticationPrincipal User user) {
        DiseaseScan scanDetails = DiseaseScan.builder()
                .cropName(request.getCropName())
                .diseaseName(request.getDiseaseName())
                .severity(request.getSeverity())
                .notes(request.getNotes())
                .build();

        DiseaseScan updatedScan = diseaseScanService.updateDiseaseScan(id, scanDetails, user);
        return ResponseEntity.ok(convertToResponse(updatedScan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiseaseScan(@PathVariable @org.springframework.lang.NonNull UUID id, @AuthenticationPrincipal User user) {
        diseaseScanService.deleteDiseaseScan(id, user);
        return ResponseEntity.noContent().build();
    }

    private DiseaseScanResponse convertToResponse(DiseaseScan scan) {
        DiseaseScanResponse response = new DiseaseScanResponse();
        response.setId(scan.getId());
        response.setCropName(scan.getCropName());
        response.setDiseaseName(scan.getDiseaseName());
        response.setSeverity(scan.getSeverity());
        response.setConfidence(scan.getConfidence());
        response.setLatitude(scan.getLatitude());
        response.setLongitude(scan.getLongitude());
        response.setLocationName(scan.getLocationName());
        response.setImageUrl(scan.getImageUrl());
        response.setNotes(scan.getNotes());
        response.setScannedAt(scan.getScannedAt());
        response.setCreatedAt(scan.getCreatedAt());
        return response;
    }
}
