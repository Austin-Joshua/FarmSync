package com.farmsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final List<Map<String, Object>> alerts = new CopyOnWriteArrayList<>();

    public AlertController() {
        seedAlerts();
    }

    private void seedAlerts() {
        Map<String, Object> alert1 = new HashMap<>();
        alert1.put("id", UUID.randomUUID().toString());
        alert1.put("alert_type", "heavy_rain");
        alert1.put("severity", "high");
        alert1.put("title", "Heavy Rainfall Expected");
        alert1.put("message", "Meteorological department predicts heavy rainfall of 50-80mm over the next 24 hours. Ensure drainage is clear.");
        alert1.put("recommendation", "Clear all drainage channels and delay fertilizer application.");
        alerts.add(alert1);

        Map<String, Object> alert2 = new HashMap<>();
        alert2.put("id", UUID.randomUUID().toString());
        alert2.put("alert_type", "storm");
        alert2.put("severity", "critical");
        alert2.put("title", "Severe Wind Warning");
        alert2.put("message", "High winds up to 60 km/h expected this evening. Secure loose structures and greenhouse covers.");
        alert2.put("recommendation", "Reinforce greenhouse plastic sheets and secure light farm machinery.");
        alerts.add(alert2);

        Map<String, Object> alert3 = new HashMap<>();
        alert3.put("id", UUID.randomUUID().toString());
        alert3.put("alert_type", "extreme_heat");
        alert3.put("severity", "medium");
        alert3.put("title", "High Temperature Alert");
        alert3.put("message", "Temperatures expected to exceed 42°C over the next 3 days. Increase irrigation frequency.");
        alert3.put("recommendation", "Irrigate early morning or late evening to minimize evaporation.");
        alerts.add(alert3);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadAlerts() {
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAlertsAsRead() {
        alerts.clear();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAlertAsRead(@PathVariable String id) {
        alerts.removeIf(alert -> id.equals(alert.get("id")));
        return ResponseEntity.ok().build();
    }
}
