package com.farmsync.service;

import com.farmsync.model.DiseaseScan;
import com.farmsync.model.User;
import com.farmsync.repository.DiseaseScanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DiseaseScanService {

    @Autowired
    private DiseaseScanRepository diseaseScanRepository;

    public List<DiseaseScan> findByUserId(UUID userId, User user) {
        // Security check
        if (!userId.equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        return diseaseScanRepository.findByUserId(userId);
    }

    public Optional<DiseaseScan> findById(@org.springframework.lang.NonNull UUID id, User user) {
        DiseaseScan scan = diseaseScanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disease scan not found"));
        
        // Security check
        if (!scan.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return Optional.of(scan);
    }

    @Transactional
    public DiseaseScan createDiseaseScan(DiseaseScan scan, User user) {
        scan.setUser(user);
        return diseaseScanRepository.save(scan);
    }

    @Transactional
    public DiseaseScan updateDiseaseScan(@org.springframework.lang.NonNull UUID id, DiseaseScan scanDetails, User user) {
        DiseaseScan scan = diseaseScanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disease scan not found"));

        if (!scan.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        if (scanDetails.getCropName() != null) scan.setCropName(scanDetails.getCropName());
        if (scanDetails.getDiseaseName() != null) scan.setDiseaseName(scanDetails.getDiseaseName());
        if (scanDetails.getSeverity() != null) scan.setSeverity(scanDetails.getSeverity());
        if (scanDetails.getNotes() != null) scan.setNotes(scanDetails.getNotes());

        return diseaseScanRepository.save(scan);
    }

    @Transactional
    public void deleteDiseaseScan(@org.springframework.lang.NonNull UUID id, User user) {
        DiseaseScan scan = diseaseScanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disease scan not found"));

        if (!scan.getUser().getId().equals(user.getId()) && !user.getRole().equals("admin")) {
            throw new RuntimeException("Unauthorized access");
        }

        diseaseScanRepository.delete(scan);
    }
}
