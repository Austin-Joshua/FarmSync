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
    }
}
