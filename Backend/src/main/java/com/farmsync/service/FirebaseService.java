package com.farmsync.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FirebaseService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseService.class);

    public String saveData(String collection, String documentId, Map<String, Object> data) {
        if (collection == null || documentId == null || data == null) {
            throw new IllegalArgumentException("Collection, documentId, and data must not be null");
        }
        try {
            Firestore dbFirestore = FirestoreClient.getFirestore();
            ApiFuture<WriteResult> collectionsApiFuture = dbFirestore.collection(collection).document(documentId).set(data);
            return collectionsApiFuture.get().getUpdateTime().toString();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error saving data to Firestore: {}/{}", collection, documentId, e);
            throw new RuntimeException("Failed to save data to Firebase", e);
        }
    }

    public List<Map<String, Object>> getAllData(String collection) {
        if (collection == null) {
            throw new IllegalArgumentException("Collection must not be null");
        }
        try {
            Firestore dbFirestore = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = dbFirestore.collection(collection).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            return documents.stream()
                    .map(DocumentSnapshot::getData)
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error retrieving data from Firestore collection: {}", collection, e);
            throw new RuntimeException("Failed to retrieve data from Firebase", e);
        }
    }

    public void sendPushNotification(String token, String title, String body) {
        if (token == null || token.isEmpty()) {
            logger.warn("Skipping push notification: Token is null or empty");
            return;
        }

        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .build();

        try {
            FirebaseMessaging.getInstance().send(message);
            logger.info("Successfully sent push notification to token: {}", token);
        } catch (Exception e) {
            logger.error("Error sending push notification to token: {}", token, e);
        }
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        String fileName = folder + "/" + UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Bucket bucket = StorageClient.getInstance().bucket();
        
        InputStream content = file.getInputStream();
        bucket.create(fileName, content, file.getContentType());
        
        // Return public URL or internal bucket path
        return fileName; 
    }
}
