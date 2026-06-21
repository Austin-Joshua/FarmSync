package com.farmsync.service;

import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
        }
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getName() != null) user.setName(userDetails.getName());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
        if (userDetails.getState() != null) user.setState(userDetails.getState());
        if (userDetails.getDistrict() != null) user.setDistrict(userDetails.getDistrict());
        if (userDetails.getVillage() != null) user.setVillage(userDetails.getVillage());
        if (userDetails.getLandSize() != null) user.setLandSize(userDetails.getLandSize());
        if (userDetails.getSoilType() != null) user.setSoilType(userDetails.getSoilType());
        if (userDetails.getPictureUrl() != null) user.setPictureUrl(userDetails.getPictureUrl());
        if (userDetails.getPreferredLanguage() != null) user.setPreferredLanguage(userDetails.getPreferredLanguage());
        if (userDetails.getFcmToken() != null) user.setFcmToken(userDetails.getFcmToken());

        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
