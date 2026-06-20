package com.farmsync.controller;

import com.farmsync.model.Certification;
import com.farmsync.model.Farm;
import com.farmsync.model.User;
import com.farmsync.repository.CertificationRepository;
import com.farmsync.repository.FarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/compliance/certifications")
public class ComplianceController {

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private FarmRepository farmRepository;

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<Certification>> getCertifications(@AuthenticationPrincipal User user, @PathVariable UUID farmId) {
        Optional<Farm> farm = farmRepository.findById(farmId);
        if (farm.isPresent() && farm.get().getFarmer().getId().equals(user.getId())) {
            return ResponseEntity.ok(certificationRepository.findByFarmId(farmId));
        }
        return ResponseEntity.status(403).build();
    }

    @PostMapping("/farm/{farmId}")
    public ResponseEntity<Certification> applyForCertification(@AuthenticationPrincipal User user, @PathVariable UUID farmId, @RequestBody Certification cert) {
        Optional<Farm> farm = farmRepository.findById(farmId);
        if (farm.isPresent() && farm.get().getFarmer().getId().equals(user.getId())) {
            cert.setFarm(farm.get());
            cert.setStatus("PENDING");
            return ResponseEntity.ok(certificationRepository.save(cert));
        }
        return ResponseEntity.status(403).build();
    }
}
