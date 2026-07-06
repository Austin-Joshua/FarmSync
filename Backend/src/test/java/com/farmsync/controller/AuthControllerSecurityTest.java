package com.farmsync.controller;

import com.farmsync.service.AuthService;
import com.farmsync.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerSecurityTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authController, "seedDemoDataEnabled", false);
    }

    @Test
    void sendOtp_doesNotLeakDebugOtpWhenSeedDisabled() {
        when(authService.generateAndSendOtp(anyString())).thenReturn("123456");

        ResponseEntity<?> response = authController.sendOtp(Map.of("phone", "+919876543210"));

        assertEquals(200, response.getStatusCode().value());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("OTP sent successfully", body.get("message"));
        assertFalse(body.containsKey("debug_otp"));
    }

    @Test
    void requestPasswordReset_doesNotLeakDebugTokenWhenSeedDisabled() {
        when(authService.generatePasswordResetToken(anyString())).thenReturn("reset-token-uuid");

        ResponseEntity<?> response = authController.requestPasswordReset(Map.of("email", "user@test.com"));

        assertEquals(200, response.getStatusCode().value());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Password reset link sent to your email", body.get("message"));
        assertFalse(body.containsKey("debug_token"));
    }
}
