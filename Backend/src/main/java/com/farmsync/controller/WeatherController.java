package com.farmsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import com.farmsync.model.WeatherAlert;
import com.farmsync.repository.WeatherAlertRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherAlertRepository weatherAlertRepository;

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentWeather(@RequestParam String location) {
        // Mocking a weather API response for demonstration
        Map<String, Object> weatherData = new HashMap<>();
        weatherData.put("location", location);
        weatherData.put("temperature", 28.5);
        weatherData.put("humidity", 65);
        weatherData.put("condition", "Partly Cloudy");
        weatherData.put("windSpeed", 12.5);
        weatherData.put("precipitation", 0.0);
        return ResponseEntity.ok(weatherData);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<WeatherAlert>> getWeatherAlerts(@RequestParam String location) {
        // In a real application, this would query an external service or a populated database.
        // For demonstration, if no alerts exist, we can return an empty list or a mock alert.
        List<WeatherAlert> alerts = weatherAlertRepository.findByLocationOrderByCreatedAtDesc(location);
        
        if (alerts.isEmpty()) {
            // Seed a mock alert if none exist for UI testing purposes
            WeatherAlert mockAlert = new WeatherAlert();
            mockAlert.setTitle("Heavy Rain Warning");
            mockAlert.setSeverity("WARNING");
            mockAlert.setMessage("Expected heavy rainfall over the next 48 hours. Secure harvested crops.");
            mockAlert.setLocation(location);
            mockAlert.setActiveUntil(java.time.LocalDateTime.now().plusDays(2));
            alerts.add(mockAlert);
        }
        
        return ResponseEntity.ok(alerts);
    }
}
