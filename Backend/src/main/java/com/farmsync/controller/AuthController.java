package com.farmsync.controller;

import com.farmsync.dto.LoginRequest;
import com.farmsync.dto.LoginResponse;
import com.farmsync.model.User;
import com.farmsync.service.AuthService;
import com.farmsync.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

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

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
        try {
            String refreshToken = body.get("refreshToken");
            LoginResponse response = authService.refreshAccessToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> body) {
        try {
            if (body != null && body.containsKey("refreshToken")) {
                authService.revokeRefreshToken(body.get("refreshToken"));
            }
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Logged out"));
        }
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String phone = body.get("phone");
            if (phone == null || phone.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
            }
            String otp = authService.generateAndSendOtp(phone);
            // In production this would be sent via SMS; in dev we return it for testing
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            response.put("debug_otp", otp); // Remove in production
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String phone = body.get("phone");
            String otp = body.get("otp");
            String name = body.getOrDefault("name", "Phone User");
            if (phone == null || otp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone and OTP are required"));
            }
            LoginResponse response = authService.verifyOtpAndLogin(phone, otp, name);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            String token = authService.generatePasswordResetToken(email);
            // In production this would be sent via email
            return ResponseEntity.ok(Map.of(
                "message", "Password reset link sent to your email",
                "debug_token", token // Remove in production
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            if (token == null || newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid token and password (min 6 chars) required"));
            }
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUser() {
        org.springframework.security.core.Authentication authentication =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ResponseEntity.ok((User) authentication.getPrincipal());
        }
        return ResponseEntity.status(401).build();
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateCurrentUserProfile(@RequestBody User userDetails) {
        org.springframework.security.core.Authentication authentication =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            User updatedUser = userService.updateUser(currentUser.getId(), userDetails);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.status(401).build();
    }
}
