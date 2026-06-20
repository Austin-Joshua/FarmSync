package com.farmsync.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/iot")
public class IoTSensorController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // The python script will POST to this endpoint
    @PostMapping("/push")
    public ResponseEntity<String> receiveSensorData(@RequestBody Map<String, Object> payload) {
        // Broadcast the payload to all subscribed clients on the /topic/sensors channel
        messagingTemplate.convertAndSend("/topic/sensors", payload);
        return ResponseEntity.ok("Sensor data broadcasted successfully.");
    }
}
