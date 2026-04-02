package com.farmsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class WeatherController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getClimateAlerts(
            @RequestParam double lat,
            @RequestParam double lon) {
        
        // Mocking climate alerts logic
        Map<String, Object> response = new HashMap<>();
        List<Map<String, String>> alerts = new ArrayList<>();
        
        // In a real app, logic would call an external API or check Firestore
        if (lat > 0) { // Demo condition
            Map<String, String> alert = new HashMap<>();
            alert.put("id", "alert-001");
            alert.put("type", "Flood Warning");
            alert.put("severity", "High");
            alert.put("description", "Heavy rainfall expected in next 24 hours. Monitor drainage systems.");
            alerts.add(alert);
        }
        
        response.put("latitude", lat);
        response.put("longitude", lon);
        response.put("alerts", alerts);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
