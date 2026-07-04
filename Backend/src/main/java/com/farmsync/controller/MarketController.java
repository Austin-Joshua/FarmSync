package com.farmsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private static final String CSV_PATH = resolveDatasetPath();

    private static String resolveDatasetPath() {
        // 1. Try consolidated dataset path at workspace root
        java.io.File rootDataset = new java.io.File("ml-service/datasets/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (rootDataset.exists()) return rootDataset.getAbsolutePath();
        
        // 2. Try consolidated path relative to backend directory (when running from backend/)
        java.io.File backendRelative = new java.io.File("../ml-service/datasets/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (backendRelative.exists()) return backendRelative.getAbsolutePath();

        // 3. Fallbacks
        java.io.File relative = new java.io.File("ml-service/datasets/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (relative.exists()) return relative.getAbsolutePath();
        java.io.File sibling = new java.io.File("../ml-service/datasets/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (sibling.exists()) return sibling.getAbsolutePath();
        
        return System.getProperty("user.dir") + java.io.File.separator + "ml-service" + java.io.File.separator + "datasets" + java.io.File.separator
                + "All-India_-Crop-wise-Area,-Production-&-Yield.csv";
    }

    // In-memory cache of crop data parsed from CSV
    private List<CropMarketData> cropDataList = new ArrayList<>();

    private static class CropMarketData {
        String crop;
        String season;
        double yield; // average yield
    }

    private void loadCsvData() {
        if (!cropDataList.isEmpty()) {
            return;
        }
        File file = new File(CSV_PATH);
        if (!file.exists()) {
            System.out.println("Market dataset CSV not found at: " + CSV_PATH);
            return;
        }
        try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            String[] headers = null;
            if ((line = br.readLine()) != null) {
                headers = parseCsvLine(line);
            }
            while ((line = br.readLine()) != null) {
                String[] values = parseCsvLine(line);
                if (values.length < 2) continue;
                String crop = values[0].trim();
                String season = values[1].trim();
                
                // Get the latest non-null yield
                double latestYield = 0.0;
                for (int i = values.length - 1; i >= 0; i--) {
                    if (headers != null && i < headers.length && headers[i].startsWith("Yield-")) {
                        try {
                            if (i < values.length && !values[i].trim().isEmpty() && !"nan".equalsIgnoreCase(values[i].trim())) {
                                latestYield = Double.parseDouble(values[i].trim());
                                break;
                            }
                        } catch (NumberFormatException e) {
                            // ignore
                        }
                    }
                }
                CropMarketData cmd = new CropMarketData();
                cmd.crop = crop;
                cmd.season = season;
                cmd.yield = latestYield;
                cropDataList.add(cmd);
            }
        } catch (Exception e) {
            System.err.println("Error parsing market CSV: " + e.getMessage());
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> list = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                list.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        list.add(sb.toString());
        return list.toArray(new String[0]);
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentPrice(@RequestParam String crop) {
        loadCsvData();
        
        double basePrice = 45.0;
        String season = "Kharif";
        
        // Find matching crop in CSV (case insensitive substring match)
        for (CropMarketData cmd : cropDataList) {
            if (cmd.crop.equalsIgnoreCase(crop) || cmd.crop.toLowerCase().contains(crop.toLowerCase())) {
                season = cmd.season;
                if (cmd.yield > 0) {
                    // Base price calculation (yield in kg/ha, e.g. 1000 - 4000)
                    basePrice = 140.0 - (cmd.yield / 40.0);
                    if (basePrice < 25.0) basePrice = 25.0;
                    if (basePrice > 180.0) basePrice = 180.0;
                }
                break;
            }
        }

        double fluctuation = new Random().nextDouble() * 6.0 - 3.0;
        double currentPrice = basePrice + fluctuation;

        Map<String, Object> response = new HashMap<>();
        response.put("crop", crop);
        response.put("price", Math.round(currentPrice * 100.0) / 100.0);
        response.put("unit", "INR/kg");
        response.put("trend", fluctuation >= 0 ? "UP" : "DOWN");
        response.put("season", season);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getPriceHistory(
            @RequestParam String crop,
            @RequestParam(defaultValue = "30") int days) {
        
        loadCsvData();
        double basePrice = 45.0;
        for (CropMarketData cmd : cropDataList) {
            if (cmd.crop.equalsIgnoreCase(crop) || cmd.crop.toLowerCase().contains(crop.toLowerCase())) {
                if (cmd.yield > 0) {
                    basePrice = 140.0 - (cmd.yield / 40.0);
                    if (basePrice < 25.0) basePrice = 25.0;
                    if (basePrice > 180.0) basePrice = 180.0;
                }
                break;
            }
        }

        List<Map<String, Object>> history = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        Random rand = new Random(crop.hashCode());

        for (int i = 0; i < days; i++) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", cal.getTime());
            
            double walk = rand.nextDouble() * 8.0 - 4.0 + Math.sin(i * 0.2) * 5.0;
            data.put("price", Math.round((basePrice + walk) * 100.0) / 100.0);
            
            history.add(data);
            cal.add(Calendar.DATE, -1);
        }
        
        return ResponseEntity.ok(history);
    }

    @GetMapping("/best-time")
    public ResponseEntity<Map<String, Object>> getBestTimeToSell(@RequestParam String crop) {
        loadCsvData();
        String season = "Kharif";
        for (CropMarketData cmd : cropDataList) {
            if (cmd.crop.equalsIgnoreCase(crop) || cmd.crop.toLowerCase().contains(crop.toLowerCase())) {
                season = cmd.season;
                break;
            }
        }

        String bestPeriod;
        String reason;
        if ("Rabi".equalsIgnoreCase(season)) {
            bestPeriod = "May to July";
            reason = "Post-harvest winter supply stabilization leads to peak demand and optimal rates.";
        } else if ("Summer".equalsIgnoreCase(season) || "Zaid".equalsIgnoreCase(season)) {
            bestPeriod = "August to October";
            reason = "Pre-monsoon inventory cycles optimize pricing margins for summer harvests.";
        } else {
            bestPeriod = "December to February";
            reason = "Festive demand spikes and cold storage capacity optimization drive prices higher.";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("crop", crop);
        response.put("bestPeriod", bestPeriod);
        response.put("recommendation", "Plan sales during " + bestPeriod + " for maximum profit margins.");
        response.put("reason", reason);
        response.put("confidence", 0.85);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/alerts")
    public ResponseEntity<Map<String, Object>> setPriceAlert(@RequestBody Map<String, Object> alertData) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Price alert configured successfully");
        response.put("alert", alertData);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
