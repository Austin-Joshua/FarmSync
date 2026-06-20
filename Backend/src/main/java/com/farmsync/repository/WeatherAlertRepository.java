package com.farmsync.repository;

import com.farmsync.model.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, UUID> {
    List<WeatherAlert> findByLocationOrderByCreatedAtDesc(String location);
}
