package com.farmsync.controller;

import com.farmsync.repository.FarmRepository;
import com.farmsync.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/fields")
public class FieldController {

    private final FirebaseService firebaseService;

    @Autowired
    private FarmRepository farmRepository;

    private final Map<String, Map<String, Object>> mockFields = new ConcurrentHashMap<>();

    public FieldController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
        initMockFields();
    }

    private boolean isFirebaseAvailable() {
        try {
            return !com.google.firebase.FirebaseApp.getApps().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private void initMockFields() {
        String dummyFarmId = "69a740e1-e256-4a02-b0f7-d0036173b8fb";

        // Seed field 1: North Field
        String id1 = UUID.randomUUID().toString();
        Map<String, Object> f1 = new HashMap<>();
        f1.put("id", id1);
        f1.put("farm_id", dummyFarmId);
        f1.put("name", "North Field");
        f1.put("area", 5.2);
        f1.put("latitude", 11.0168);
        f1.put("longitude", 76.9558);
        f1.put("soil_type_name", "Black (Regur)");
        f1.put("soil_test_date", "2026-05-15");
        f1.put("created_at", java.time.LocalDateTime.now().toString());
        mockFields.put(id1, f1);

        // Seed field 2: East Crop Zone
        String id2 = UUID.randomUUID().toString();
        Map<String, Object> f2 = new HashMap<>();
        f2.put("id", id2);
        f2.put("farm_id", dummyFarmId);
        f2.put("name", "East Crop Zone");
        f2.put("area", 4.8);
        f2.put("latitude", 11.0180);
        f2.put("longitude", 76.9575);
        f2.put("soil_type_name", "Alluvial");
        f2.put("soil_test_date", "2026-06-01");
        f2.put("created_at", java.time.LocalDateTime.now().toString());
        mockFields.put(id2, f2);

        // Seed field 3: Southern Meadows
        String id3 = UUID.randomUUID().toString();
        Map<String, Object> f3 = new HashMap<>();
        f3.put("id", id3);
        f3.put("farm_id", dummyFarmId);
        f3.put("name", "Southern Meadows");
        f3.put("area", 2.5);
        f3.put("latitude", 11.0150);
        f3.put("longitude", 76.9540);
        f3.put("soil_type_name", "Red");
        f3.put("soil_test_date", "2026-04-10");
        f3.put("created_at", java.time.LocalDateTime.now().toString());
        mockFields.put(id3, f3);
    }

    private void ensureFarmIdsAreLinked() {
        try {
            if (farmRepository != null) {
                List<com.farmsync.model.Farm> farms = farmRepository.findAll();
                if (!farms.isEmpty()) {
                    String actualFarmId = farms.get(0).getId().toString();
                    for (Map<String, Object> field : mockFields.values()) {
                        String fId = (String) field.get("farm_id");
                        if ("69a740e1-e256-4a02-b0f7-d0036173b8fb".equals(fId) || fId == null || fId.isEmpty()) {
                            field.put("farm_id", actualFarmId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFields() 
            throws ExecutionException, InterruptedException {
        if (isFirebaseAvailable()) {
            return ResponseEntity.ok(firebaseService.getAllData("fields"));
        } else {
            ensureFarmIdsAreLinked();
            return ResponseEntity.ok(new ArrayList<>(mockFields.values()));
        }
    }

    @PostMapping("/{id}")
    public ResponseEntity<String> saveField(@PathVariable String id, @RequestBody Map<String, Object> fieldData) 
            throws ExecutionException, InterruptedException {
        if (isFirebaseAvailable()) {
            String updateTime = firebaseService.saveData("fields", id, fieldData);
            return ResponseEntity.ok("Successfully updated field at " + updateTime);
        } else {
            fieldData.put("id", id);
            mockFields.put(id, fieldData);
            return ResponseEntity.ok("Successfully updated field in-memory at " + java.time.LocalDateTime.now());
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createField(@RequestBody Map<String, Object> fieldData) 
            throws ExecutionException, InterruptedException {
        String id = UUID.randomUUID().toString();
        fieldData.put("id", id);
        fieldData.put("created_at", java.time.LocalDateTime.now().toString());
        if (isFirebaseAvailable()) {
            firebaseService.saveData("fields", id, fieldData);
        } else {
            mockFields.put(id, fieldData);
        }
        return ResponseEntity.status(201).body(fieldData);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateField(@PathVariable String id, @RequestBody Map<String, Object> fieldData) 
            throws ExecutionException, InterruptedException {
        fieldData.put("id", id);
        if (isFirebaseAvailable()) {
            firebaseService.saveData("fields", id, fieldData);
        } else {
            mockFields.put(id, fieldData);
        }
        return ResponseEntity.ok(fieldData);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable String id) {
        if (isFirebaseAvailable()) {
            // FirebaseService doesn't have delete currently, but if it did we would call it.
            // For now we do nothing for Firebase, but remove from mock.
        }
        mockFields.remove(id);
        return ResponseEntity.noContent().build();
    }
}
