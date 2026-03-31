package com.farmsync.controller;

import com.farmsync.dto.LoginRequest;
import com.farmsync.dto.LoginResponse;
import com.farmsync.model.User;
import com.farmsync.service.AuthService;
import com.farmsync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        // This is a simplified version, ideally you'd get the user from the SecurityContext
        // or validate the token and extract the user email/ID.
        // For now, let's just return a successful response if the token is present.
        return ResponseEntity.ok(new User()); 
    }
}
