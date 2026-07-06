package com.farmsync.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${farmsync.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("version", "v1.0.4");

        // Check DB connectivity
        String dbStatus;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbStatus = "UP";
        } catch (Exception e) {
            dbStatus = "DOWN: " + e.getMessage();
        }
        status.put("database", dbStatus);

        // Check ML service connectivity
        String mlStatus;
        try {
            String mlResponse = WebClient.create(mlServiceUrl)
                    .get()
                    .uri("/")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(java.time.Duration.ofSeconds(3));
            mlStatus = mlResponse != null ? "UP" : "UNKNOWN";
        } catch (Exception e) {
            mlStatus = "DOWN: " + e.getMessage();
        }
        status.put("mlService", mlStatus);

        // Overall health: UP only if all subsystems are UP
        boolean healthy = "UP".equals(dbStatus) && "UP".equals(mlStatus);
        status.put("status", healthy ? "UP" : "DEGRADED");

        return ResponseEntity.status(healthy ? 200 : 503).body(status);
    }
}
