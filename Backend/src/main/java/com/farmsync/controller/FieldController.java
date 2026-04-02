package com.farmsync.controller;

import com.farmsync.service.FirebaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/fields")
public class FieldController {

    private final FirebaseService firebaseService;

    public FieldController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    @PostMapping("/{id}")
    public ResponseEntity<String> saveField(@PathVariable String id, @RequestBody Map<String, Object> fieldData) 
            throws ExecutionException, InterruptedException {
        String updateTime = firebaseService.saveData("fields", id, fieldData);
        return ResponseEntity.ok("Successfully updated field at " + updateTime);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFields() 
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(firebaseService.getAllData("fields"));
    }
}
