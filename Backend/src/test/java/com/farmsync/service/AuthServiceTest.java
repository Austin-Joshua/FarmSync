package com.farmsync.service;

import com.farmsync.dto.LoginRequest;
import com.farmsync.dto.LoginResponse;
import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import com.farmsync.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test Farmer")
                .email("farmer@test.com")
                .password("encoded-password")
                .role("farmer")
                .build();

        loginRequest = new LoginRequest("farmer@test.com", "password123");
    }

    @Test
    void login_success_returnsTokenAndUser() {
        when(userRepository.findByEmail("farmer@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(true);
        when(jwtUtils.generateToken(testUser)).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(testUser, response.getUser());
        assertNotNull(response.getRefreshToken());
        verify(userRepository).save(testUser);
    }

    @Test
    void login_wrongPassword_throwsAccessDenied() {
        when(userRepository.findByEmail("farmer@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> authService.login(loginRequest));
        verify(jwtUtils, never()).generateToken(any(User.class));
    }

    @Test
    void login_unknownUser_throwsRuntimeException() {
        when(userRepository.findByEmail("farmer@test.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void generateAndSendOtp_returnsSixDigitCode() {
        String otp = authService.generateAndSendOtp("+919876543210");

        assertNotNull(otp);
        assertEquals(6, otp.length());
        assertTrue(otp.matches("\\d{6}"));
    }

    @Test
    void generatePasswordResetToken_persistsTokenForUser() {
        when(userRepository.findByEmail("farmer@test.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String token = authService.generatePasswordResetToken("farmer@test.com");

        assertNotNull(token);
        assertFalse(token.isBlank());
        verify(userRepository).save(testUser);
        assertEquals(token, testUser.getResetPasswordToken());
    }
}
