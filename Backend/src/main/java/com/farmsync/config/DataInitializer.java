package com.farmsync.config;

import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@farmsync.com")) {
            User admin = User.builder()
                    .id(UUID.randomUUID())
                    .name("Admin")
                    .email("admin@farmsync.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("admin")
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@farmsync.com / admin123");
        }

        // Seed Soil Types
        String[] defaultSoils = {"Alluvial", "Black (Regur)", "Red", "Laterite", "Arid", "Saline", "Peaty", "Forest", "Other"};
        for (String soilName : defaultSoils) {
            if (soilTypeRepository.findByName(soilName).isEmpty()) {
                soilTypeRepository.save(com.farmsync.model.SoilType.builder()
                        .id(java.util.UUID.randomUUID())
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
                        .id(java.util.UUID.randomUUID())
                        .name(cropName)
                        .category("Cereals")
                        .season("kharif")
                        .growthPeriod(120)
                        .waterRequirement("medium")
                        .description("Standard " + cropName + " crop type.")
                        .build());
            }
        }
    }
}
