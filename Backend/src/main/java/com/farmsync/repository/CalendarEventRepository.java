package com.farmsync.repository;

import com.farmsync.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findByUserId(UUID userId);
    List<CalendarEvent> findByUserIdAndEventDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
}
