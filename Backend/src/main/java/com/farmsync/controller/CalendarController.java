package com.farmsync.controller;

import com.farmsync.model.CalendarEvent;
import com.farmsync.model.User;
import com.farmsync.repository.CalendarEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar/events")
public class CalendarController {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    private Map<String, Object> eventToMap(CalendarEvent event) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", event.getId());
        map.put("event_type", event.getEventType());
        map.put("title", event.getTitle());
        map.put("description", event.getDescription());
        map.put("event_date", event.getEventDate().toString());
        map.put("reminder_days", event.getReminderDays());
        map.put("is_completed", event.isCompleted());
        return map;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getEvents(
            @RequestParam(name = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user) {

        List<CalendarEvent> events;
        if (startDate != null && endDate != null) {
            events = calendarEventRepository.findByUserIdAndEventDateBetween(user.getId(), startDate, endDate);
        } else {
            events = calendarEventRepository.findByUserId(user.getId());
        }

        List<Map<String, Object>> result = events.stream()
                .map(this::eventToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        CalendarEvent event = CalendarEvent.builder()
                .eventType((String) body.getOrDefault("event_type", "other"))
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .eventDate(LocalDate.parse((String) body.get("event_date")))
                .reminderDays(body.get("reminder_days") != null ? ((Number) body.get("reminder_days")).intValue() : 7)
                .isCompleted(body.get("is_completed") != null && (Boolean) body.get("is_completed"))
                .user(user)
                .build();

        CalendarEvent saved = calendarEventRepository.save(event);
        return ResponseEntity.status(201).body(eventToMap(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEvent(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (body.containsKey("event_type")) event.setEventType((String) body.get("event_type"));
        if (body.containsKey("title")) event.setTitle((String) body.get("title"));
        if (body.containsKey("description")) event.setDescription((String) body.get("description"));
        if (body.containsKey("event_date")) event.setEventDate(LocalDate.parse((String) body.get("event_date")));
        if (body.containsKey("reminder_days")) event.setReminderDays(((Number) body.get("reminder_days")).intValue());
        if (body.containsKey("is_completed")) event.setCompleted((Boolean) body.get("is_completed"));

        CalendarEvent saved = calendarEventRepository.save(event);
        return ResponseEntity.ok(eventToMap(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        calendarEventRepository.delete(event);
        return ResponseEntity.ok().build();
    }
}
