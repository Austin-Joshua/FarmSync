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

    public Optional<User> findById(@org.springframework.lang.NonNull UUID id) {
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
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(java.util.Objects.requireNonNull(user));
    }

    @Transactional
    public User updateUser(@org.springframework.lang.NonNull UUID id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getName() != null) user.setName(userDetails.getName());
        if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
        if (userDetails.getLandSize() != null) user.setLandSize(userDetails.getLandSize());
        if (userDetails.getSoilType() != null) user.setSoilType(userDetails.getSoilType());
        if (userDetails.getPictureUrl() != null) user.setPictureUrl(userDetails.getPictureUrl());

        return userRepository.save(java.util.Objects.requireNonNull(user));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
