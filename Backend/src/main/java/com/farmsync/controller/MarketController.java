package com.farmsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentPrice(@RequestParam String crop) {
        // Mocked real-time market data
        Map<String, Object> response = new HashMap<>();
        response.put("crop", crop);
        response.put("price", 45.5 + (new Random().nextDouble() * 5));
        response.put("unit", "INR/kg");
        response.put("trend", "UP");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getPriceHistory(
            @RequestParam String crop,
            @RequestParam(defaultValue = "7") int days) {
        
        List<Map<String, Object>> history = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        Random rand = new Random();
        
        for (int i = 0; i < days; i++) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", cal.getTime());
            data.put("price", 40.0 + (rand.nextDouble() * 10));
            history.add(data);
            cal.add(Calendar.DATE, -1);
        }
        
        return ResponseEntity.ok(history);
    }
}
