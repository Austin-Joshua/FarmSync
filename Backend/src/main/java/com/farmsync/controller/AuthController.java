package com.farmsync.controller;

import com.farmsync.dto.LoginRequest;
import com.farmsync.dto.LoginResponse;
import com.farmsync.model.User;
import com.farmsync.service.AuthService;
import com.farmsync.service.UserService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Value("${farmsync.seed-demo-data:false}")
    private boolean seedDemoDataEnabled;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        LoginResponse response = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> body) {
        if (body != null && body.containsKey("refreshToken")) {
            authService.revokeRefreshToken(body.get("refreshToken"));
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("Phone number is required");
        }
        String otp = authService.generateAndSendOtp(phone);
        logger.debug("OTP generated for phone {} (not returned in production)", phone);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent successfully");
        if (seedDemoDataEnabled) {
            response.put("debug_otp", otp);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String otp = body.get("otp");
        String name = body.getOrDefault("name", "Phone User");
        if (phone == null || otp == null) {
            throw new RuntimeException("Phone and OTP are required");
        }
        LoginResponse response = authService.verifyOtpAndLogin(phone, otp, name);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        String token = authService.generatePasswordResetToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset link sent to your email");
        if (seedDemoDataEnabled) {
            response.put("debug_token", token);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Valid token and password (min 8 chars) required");
        }
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in."));
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
