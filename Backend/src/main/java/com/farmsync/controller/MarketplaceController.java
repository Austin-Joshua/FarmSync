package com.farmsync.controller;

import com.farmsync.model.MarketplaceItem;
import com.farmsync.model.User;
import com.farmsync.repository.MarketplaceItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    @Autowired
    private MarketplaceItemRepository marketplaceItemRepository;



    private static final String CSV_PATH = resolveDatasetPath();
    private List<CropMarketData> cropDataList = new ArrayList<>();

    private static class CropMarketData {
        String crop;
        double yield;
    }

    private static String resolveDatasetPath() {
        File rootDataset = new File("Dataset/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (rootDataset.exists()) return rootDataset.getAbsolutePath();
        File backendRelative = new File("../Dataset/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (backendRelative.exists()) return backendRelative.getAbsolutePath();
        File relative = new File("Backend/MLService/Dataset/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (relative.exists()) return relative.getAbsolutePath();
        File sibling = new File("MLService/Dataset/All-India_-Crop-wise-Area,-Production-&-Yield.csv");
        if (sibling.exists()) return sibling.getAbsolutePath();
        return System.getProperty("user.dir") + File.separator + "Dataset" + File.separator
                + "All-India_-Crop-wise-Area,-Production-&-Yield.csv";
    }

    private void loadCsvData() {
        if (!cropDataList.isEmpty()) return;
        File file = new File(CSV_PATH);
        if (!file.exists()) return;
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
                double latestYield = 0.0;
                for (int i = values.length - 1; i >= 0; i--) {
                    if (headers != null && i < headers.length && headers[i].startsWith("Yield-")) {
                        try {
                            if (!values[i].trim().isEmpty() && !"nan".equalsIgnoreCase(values[i].trim())) {
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
                cmd.yield = latestYield;
                cropDataList.add(cmd);
            }
        } catch (Exception e) {
            System.err.println("Error parsing CSV in MarketplaceController: " + e.getMessage());
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

    private double getCsvBasePrice(String name) {
        loadCsvData();
        double basePrice = 45.0;
        for (CropMarketData cmd : cropDataList) {
            if (cmd.crop.equalsIgnoreCase(name) || cmd.crop.toLowerCase().contains(name.toLowerCase())) {
                if (cmd.yield > 0) {
                    basePrice = 140.0 - (cmd.yield / 40.0);
                    if (basePrice < 25.0) basePrice = 25.0;
                    if (basePrice > 180.0) basePrice = 180.0;
                }
                break;
            }
        }
        return Math.round(basePrice * 100.0) / 100.0;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceItem>> getAllItems(@RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            return ResponseEntity.ok(marketplaceItemRepository.findByCategoryIgnoreCase(category.trim()));
        }
        return ResponseEntity.ok(marketplaceItemRepository.findAll());
    }

    @GetMapping("/my-listings")
    public ResponseEntity<List<MarketplaceItem>> getMyListings(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(marketplaceItemRepository.findByFarmerIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/product")
    public ResponseEntity<List<MarketplaceItem>> getItemsByName(@RequestParam String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(marketplaceItemRepository.findByNameIgnoreCase(name.trim()));
    }

    @GetMapping("/lowest-price")
    public ResponseEntity<Map<String, Object>> getLowestPrice(@RequestParam String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<MarketplaceItem> items = marketplaceItemRepository.findByNameIgnoreCase(name.trim());
        double lowestPrice;
        String source;

        if (!items.isEmpty()) {
            lowestPrice = items.stream()
                    .mapToDouble(item -> item != null ? item.getPrice() : 0.0)
                    .min()
                    .orElse(0.0);
            source = "listings";
        } else {
            lowestPrice = getCsvBasePrice(name.trim());
            source = "market_csv";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productName", name);
        response.put("lowestPrice", lowestPrice);
        response.put("source", source);
        response.put("averagePrice", Math.round(lowestPrice * 1.15 * 100.0) / 100.0);
        response.put("unit", "INR/kg");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MarketplaceItem> createListing(@AuthenticationPrincipal User user, @RequestBody MarketplaceItem item) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!"farmer".equalsIgnoreCase(user.getRole()) && !"admin".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Unauthorized access: only farmers can create listings");
        }

        item.setId(UUID.randomUUID());
        item.setFarmer(user);
        return ResponseEntity.ok(marketplaceItemRepository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceItem> updateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody MarketplaceItem itemDetails) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return marketplaceItemRepository.findById(id).map(item -> {
            // Check ownership or admin
            if (!item.getFarmer().getId().equals(user.getId()) && !"admin".equalsIgnoreCase(user.getRole())) {
                throw new RuntimeException("Unauthorized access");
            }
            if (itemDetails.getName() != null) item.setName(itemDetails.getName());
            if (itemDetails.getCategory() != null) item.setCategory(itemDetails.getCategory());
            if (itemDetails.getPrice() != null) item.setPrice(itemDetails.getPrice());
            if (itemDetails.getUnit() != null) item.setUnit(itemDetails.getUnit());
            if (itemDetails.getQuantity() != null) item.setQuantity(itemDetails.getQuantity());

            return ResponseEntity.ok(marketplaceItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<Map<String, Object>> buyItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Double> purchaseDetails) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Double qtyToBuy = purchaseDetails.get("quantity");
        if (qtyToBuy == null || qtyToBuy <= 0) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Invalid purchase quantity");
            return ResponseEntity.badRequest().body(error);
        }

        return marketplaceItemRepository.findById(id).map(item -> {
            if (item.getQuantity() < qtyToBuy) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Insufficient stock available. Remaining stock: " + item.getQuantity() + " " + item.getUnit());
                return ResponseEntity.badRequest().body(error);
            }

            double remaining = item.getQuantity() - qtyToBuy;
            item.setQuantity(remaining);
            
            if (remaining <= 0) {
                marketplaceItemRepository.delete(item);
            } else {
                marketplaceItemRepository.save(item);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Simulated checkout successful!");
            response.put("purchasedQuantity", qtyToBuy);
            response.put("unit", item.getUnit());
            response.put("remainingQuantity", remaining);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteListing(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return marketplaceItemRepository.findById(id).map(item -> {
            if (!item.getFarmer().getId().equals(user.getId()) && !"admin".equalsIgnoreCase(user.getRole())) {
                throw new RuntimeException("Unauthorized access");
            }
            marketplaceItemRepository.delete(item);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Listing removed successfully");
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Map<String, String>> adminDeleteListing(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!"admin".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Unauthorized access: admin role required");
        }

        return marketplaceItemRepository.findById(id).map(item -> {
            marketplaceItemRepository.delete(item);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Listing moderated and deleted by administrator");
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
