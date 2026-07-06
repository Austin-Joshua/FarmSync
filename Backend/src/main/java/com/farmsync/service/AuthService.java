package com.farmsync.service;

import com.farmsync.dto.LoginRequest;
import com.farmsync.dto.LoginResponse;
import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import com.farmsync.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // In-memory OTP store (use Redis or DB in production)
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> otpExpiry = new ConcurrentHashMap<>();

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new AccessDeniedException("Invalid email or password");
        }

        String jwt = jwtUtils.generateToken(user);
        String refreshToken = generateRefreshToken(user);
        return new LoginResponse(jwt, user, refreshToken);
    }

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setId(UUID.randomUUID());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("farmer");
        }

        return userRepository.save(user);
    }

    // === REFRESH TOKEN ===

    private String generateRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setRefreshToken(token);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(30));
        userRepository.save(user);
        return token;
    }

    public LoginResponse refreshAccessToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Refresh token expired. Please login again.");
        }

        String newJwt = jwtUtils.generateToken(user);
        String newRefreshToken = generateRefreshToken(user);
        return new LoginResponse(newJwt, user, newRefreshToken);
    }

    public void revokeRefreshToken(String refreshToken) {
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    // === PHONE OTP ===

    public String generateAndSendOtp(String phone) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(phone, otp);
        otpExpiry.put(phone, LocalDateTime.now().plusMinutes(10));

        // In production: integrate with SMS gateway (Twilio, MSG91, etc.)
        logger.debug("OTP for phone {} expires in 10 min", phone);

        return otp;
    }

    public LoginResponse verifyOtpAndLogin(String phone, String otp, String name) {
        String storedOtp = otpStore.get(phone);
        LocalDateTime expiry = otpExpiry.get(phone);

        if (storedOtp == null) {
            throw new RuntimeException("No OTP sent for this phone number");
        }
        if (expiry == null || expiry.isBefore(LocalDateTime.now())) {
            otpStore.remove(phone);
            otpExpiry.remove(phone);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // OTP valid - clean up
        otpStore.remove(phone);
        otpExpiry.remove(phone);

        // Find or create user by phone
        String syntheticEmail = "phone_" + phone.replaceAll("[^0-9]", "") + "@farmsync.app";
        User user = userRepository.findByEmail(syntheticEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .id(UUID.randomUUID())
                    .name(name)
                    .email(syntheticEmail)
                    .phone(phone)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role("farmer")
                    .build();
            return userRepository.save(newUser);
        });

        String jwt = jwtUtils.generateToken(user);
        String refreshToken = generateRefreshToken(user);
        return new LoginResponse(jwt, user, refreshToken);
    }

    // === PASSWORD RESET ===

    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // In production: send email with link containing this token
        logger.debug("Password reset token generated for email {}", email);

        return token;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }
}
