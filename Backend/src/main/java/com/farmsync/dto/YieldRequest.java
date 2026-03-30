package com.farmsync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class YieldRequest {
    private UUID cropId;
    private Double quantity;
    private LocalDate date;
    private String quality;
}
