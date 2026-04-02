package com.farmsync.controller;

import com.farmsync.service.FirebaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final FirebaseService firebaseService;

    public CropController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    @PostMapping("/{id}")
    public ResponseEntity<String> saveCrop(@PathVariable String id, @RequestBody Map<String, Object> cropData) 
            throws ExecutionException, InterruptedException {
        String updateTime = firebaseService.saveData("crops", id, cropData);
        return ResponseEntity.ok("Successfully updated crop at " + updateTime);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCrops() 
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(firebaseService.getAllData("crops"));
    }
}
