package com.farmsync.dto;

import lombok.Data;

@Data
public class StockRequest {
    private String itemName;
    private String itemType;
    private Double quantity;
    private String unit;
}
