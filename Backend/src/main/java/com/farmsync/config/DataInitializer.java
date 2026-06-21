package com.farmsync.config;

import com.farmsync.model.User;
import com.farmsync.repository.FarmRepository;
import com.farmsync.repository.CropRepository;
import com.farmsync.repository.ExpenseRepository;
import com.farmsync.repository.YieldRepository;
import com.farmsync.repository.StockItemRepository;
import com.farmsync.repository.UserRepository;
import com.farmsync.repository.SoilTypeRepository;
import com.farmsync.repository.CropTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SoilTypeRepository soilTypeRepository;

    @Autowired
    private CropTypeRepository cropTypeRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private YieldRepository yieldRepository;

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User admin = userRepository.findByEmail("admin@farmsync.com").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .id(UUID.randomUUID())
                    .name("Admin")
                    .email("admin@farmsync.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("admin")
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@farmsync.com / admin123");
        } else {
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println("Default admin user password verified/reset to admin123");
        }

        // Seed Soil Types
        String[] defaultSoils = {"Alluvial", "Black (Regur)", "Red", "Laterite", "Arid", "Saline", "Peaty", "Forest", "Other"};
        for (String soilName : defaultSoils) {
            if (soilTypeRepository.findByName(soilName).isEmpty()) {
                soilTypeRepository.save(com.farmsync.model.SoilType.builder()
                        .name(soilName)
                        .description("Default " + soilName + " soil type.")
                        .build());
            }
        }

        // Seed basic Crop Types
        String[] defaultCrops = {"Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Jute", "Tea", "Coffee"};
        for (String cropName : defaultCrops) {
            if (cropTypeRepository.findByName(cropName).isEmpty()) {
                cropTypeRepository.save(com.farmsync.model.CropType.builder()
                        .name(cropName)
                        .category("Cereals")
                        .season("kharif")
                        .growthPeriod(120)
                        .waterRequirement("medium")
                        .description("Standard " + cropName + " crop type.")
                        .build());
            }
        }

        // Seed Synthetic Data for Admin User
        admin = userRepository.findByEmail("admin@farmsync.com").orElse(null);
        if (admin != null) {
            com.farmsync.model.SoilType soil = soilTypeRepository.findByName("Black (Regur)").orElse(null);
            
            // Seed default farm if not present
            com.farmsync.model.Farm farm;
            java.util.List<com.farmsync.model.Farm> existingFarms = farmRepository.findByFarmerId(admin.getId());
            if (existingFarms.isEmpty()) {
                farm = com.farmsync.model.Farm.builder()
                        .name("Admin Primary Estate")
                        .location("Coimbatore, Tamil Nadu")
                        .landSize(12.5)
                        .soilType(soil)
                        .farmer(admin)
                        .build();
                farm = farmRepository.save(farm);
                
                // Keep admin profile in sync with local SQL database farm fields
                admin.setLocation("Coimbatore, Tamil Nadu");
                admin.setLandSize(12.5);
                admin.setSoilType("Black (Regur)");
                userRepository.save(admin);

                System.out.println("Default farm seeded for admin: Admin Primary Estate");
            } else {
                farm = existingFarms.get(0);
            }
            
            // Seed default crops if not present
            java.util.List<com.farmsync.model.Crop> existingCrops = cropRepository.findByFarmId(farm.getId());
            if (existingCrops.isEmpty()) {
                com.farmsync.model.CropType cropType = cropTypeRepository.findByName("Rice").orElse(null);
                
                com.farmsync.model.Crop activeCrop = com.farmsync.model.Crop.builder()
                        .name("IR-20 Rice")
                        .cropType(cropType)
                        .season("kharif")
                        .sowingDate(java.time.LocalDate.now().minusDays(45))
                        .status("active")
                        .farm(farm)
                        .build();
                activeCrop = cropRepository.save(activeCrop);
                
                com.farmsync.model.Crop harvestedCrop = com.farmsync.model.Crop.builder()
                        .name("Sona Masuri Wheat")
                        .cropType(cropTypeRepository.findByName("Wheat").orElse(null))
                        .season("rabi")
                        .sowingDate(java.time.LocalDate.now().minusDays(180))
                        .harvestDate(java.time.LocalDate.now().minusDays(20))
                        .status("harvested")
                        .farm(farm)
                        .build();
                harvestedCrop = cropRepository.save(harvestedCrop);
                
                System.out.println("Default crops seeded for farm");

                // Seed Yields for harvested crop
                yieldRepository.save(com.farmsync.model.Yield.builder()
                        .crop(harvestedCrop)
                        .quantity(4500.0)
                        .date(java.time.LocalDate.now().minusDays(20))
                        .quality("excellent")
                        .build());
                System.out.println("Default yields seeded for crop");
                
                // Seed expenses
                expenseRepository.save(com.farmsync.model.Expense.builder()
                        .category("seeds")
                        .description("High-yield IR-20 Rice Seeds")
                        .amount(12500.0)
                        .date(java.time.LocalDate.now().minusDays(45))
                        .farm(farm)
                        .build());
                expenseRepository.save(com.farmsync.model.Expense.builder()
                        .category("labor")
                        .description("Sowing labor expenses")
                        .amount(8000.0)
                        .date(java.time.LocalDate.now().minusDays(43))
                        .farm(farm)
                        .build());
                expenseRepository.save(com.farmsync.model.Expense.builder()
                        .category("fertilizers")
                        .description("NPK Fertilizer complex")
                        .amount(15400.0)
                        .date(java.time.LocalDate.now().minusDays(30))
                        .farm(farm)
                        .build());
                expenseRepository.save(com.farmsync.model.Expense.builder()
                        .category("irrigation")
                        .description("Drip system maintenance")
                        .amount(4500.0)
                        .date(java.time.LocalDate.now().minusDays(15))
                        .farm(farm)
                        .build());
                System.out.println("Default expenses seeded for farm");
            }
            
            // Seed stock/inventory items if not present
            java.util.List<com.farmsync.model.StockItem> existingStock = stockItemRepository.findByUserId(admin.getId());
            if (existingStock.isEmpty()) {
                stockItemRepository.save(com.farmsync.model.StockItem.builder()
                        .user(admin)
                        .itemName("Urea Nitrogen Fertilizer")
                        .itemType("fertilizer")
                        .quantity(250.0)
                        .unit("kg")
                        .build());
                stockItemRepository.save(com.farmsync.model.StockItem.builder()
                        .user(admin)
                        .itemName("Neem Oil Pesticide")
                        .itemType("pesticide")
                        .quantity(15.0)
                        .unit("liters")
                        .build());
                stockItemRepository.save(com.farmsync.model.StockItem.builder()
                        .user(admin)
                        .itemName("IR-20 Rice Seeds")
                        .itemType("seeds")
                        .quantity(80.0)
                        .unit("kg")
                        .build());
                System.out.println("Default stock inventory items seeded for user");
            }
        }

        // ===== Seed Farmer Demo User =====
        User farmer = userRepository.findByEmail("farmer@farmsync.com").orElse(null);
        if (farmer == null) {
            farmer = User.builder()
                    .id(UUID.randomUUID())
                    .name("Ravi Kumar")
                    .email("farmer@farmsync.com")
                    .password(passwordEncoder.encode("farmer123"))
                    .role("farmer")
                    .location("Salem, Tamil Nadu")
                    .landSize(8.5)
                    .soilType("Red")
                    .build();
            userRepository.save(farmer);
            System.out.println("Demo farmer user created: farmer@farmsync.com / farmer123");
        } else {
            farmer.setPassword(passwordEncoder.encode("farmer123"));
            userRepository.save(farmer);
            System.out.println("Demo farmer password reset to farmer123");
        }

        // Seed farmer's farm and crops
        final User farmerFinal = farmer;
        java.util.List<com.farmsync.model.Farm> farmerFarms = farmRepository.findByFarmerId(farmerFinal.getId());
        if (farmerFarms.isEmpty()) {
            com.farmsync.model.SoilType redSoil = soilTypeRepository.findByName("Red").orElse(null);
            com.farmsync.model.Farm farmerFarm = com.farmsync.model.Farm.builder()
                    .name("Ravi's Organic Farm")
                    .location("Salem, Tamil Nadu")
                    .landSize(8.5)
                    .soilType(redSoil)
                    .farmer(farmerFinal)
                    .build();
            farmerFarm = farmRepository.save(farmerFarm);

            // Farmer crops
            com.farmsync.model.CropType maizeType = cropTypeRepository.findByName("Maize").orElse(null);
            com.farmsync.model.Crop maizeCrop = com.farmsync.model.Crop.builder()
                    .name("Hybrid Maize HM-4")
                    .cropType(maizeType)
                    .season("kharif")
                    .sowingDate(java.time.LocalDate.now().minusDays(30))
                    .status("active")
                    .farm(farmerFarm)
                    .build();
            cropRepository.save(maizeCrop);

            com.farmsync.model.CropType cottonType = cropTypeRepository.findByName("Cotton").orElse(null);
            com.farmsync.model.Crop cottonCrop = com.farmsync.model.Crop.builder()
                    .name("MCU-5 Cotton")
                    .cropType(cottonType)
                    .season("kharif")
                    .sowingDate(java.time.LocalDate.now().minusDays(120))
                    .harvestDate(java.time.LocalDate.now().minusDays(10))
                    .status("harvested")
                    .farm(farmerFarm)
                    .build();
            cropRepository.save(cottonCrop);

            // Farmer yield
            yieldRepository.save(com.farmsync.model.Yield.builder()
                    .crop(cottonCrop)
                    .quantity(2800.0)
                    .date(java.time.LocalDate.now().minusDays(10))
                    .quality("good")
                    .build());

            // Farmer expenses
            expenseRepository.save(com.farmsync.model.Expense.builder()
                    .category("seeds")
                    .description("Hybrid Maize Seeds HM-4")
                    .amount(6500.0)
                    .date(java.time.LocalDate.now().minusDays(30))
                    .farm(farmerFarm)
                    .build());
            expenseRepository.save(com.farmsync.model.Expense.builder()
                    .category("fertilizers")
                    .description("DAP Fertilizer")
                    .amount(9200.0)
                    .date(java.time.LocalDate.now().minusDays(25))
                    .farm(farmerFarm)
                    .build());
            expenseRepository.save(com.farmsync.model.Expense.builder()
                    .category("labor")
                    .description("Harvest labor - cotton")
                    .amount(5500.0)
                    .date(java.time.LocalDate.now().minusDays(10))
                    .farm(farmerFarm)
                    .build());

            // Farmer stock
            stockItemRepository.save(com.farmsync.model.StockItem.builder()
                    .user(farmerFinal)
                    .itemName("DAP Fertilizer")
                    .itemType("fertilizer")
                    .quantity(120.0)
                    .unit("kg")
                    .build());
            stockItemRepository.save(com.farmsync.model.StockItem.builder()
                    .user(farmerFinal)
                    .itemName("Chlorpyrifos Pesticide")
                    .itemType("pesticide")
                    .quantity(8.0)
                    .unit("liters")
                    .build());
            System.out.println("Demo farmer farm, crops, and data seeded");
        }

        // ===== Seed Citizen Demo User =====
        User citizen = userRepository.findByEmail("citizen@farmsync.com").orElse(null);
        if (citizen == null) {
            citizen = User.builder()
                    .id(UUID.randomUUID())
                    .name("Priya Sharma")
                    .email("citizen@farmsync.com")
                    .password(passwordEncoder.encode("citizen123"))
                    .role("citizen")
                    .location("Chennai, Tamil Nadu")
                    .build();
            userRepository.save(citizen);
            System.out.println("Demo citizen user created: citizen@farmsync.com / citizen123");
        } else {
            citizen.setPassword(passwordEncoder.encode("citizen123"));
            userRepository.save(citizen);
            System.out.println("Demo citizen password reset to citizen123");
        }
    }
}

