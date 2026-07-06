package com.farmsync.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.path:firebase-service-account.json}")
    private String firebaseConfigPath;

    @Value("${firebase.storage.bucket:lunar-db-10d04.appspot.com}")
    private String storageBucket;

    @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}")
    private String firebaseServiceAccountJson;

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount;
            if (firebaseServiceAccountJson != null && !firebaseServiceAccountJson.isBlank()) {
                serviceAccount = new ByteArrayInputStream(firebaseServiceAccountJson.getBytes(StandardCharsets.UTF_8));
            } else {
                serviceAccount = new FileInputStream(firebaseConfigPath);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(storageBucket)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("Firebase initialized successfully");
            }
        } catch (IOException e) {
            // Log as error — the app will continue but Firebase-dependent features will fail.
            // In a stricter setup, rethrow here to fail fast on startup.
            logger.error("CRITICAL: Firebase initialization failed. Firebase-based features (push notifications, Firestore) will be unavailable: {}", e.getMessage());
        }
    }
}
