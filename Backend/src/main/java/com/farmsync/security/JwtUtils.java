package com.farmsync.security;

import com.farmsync.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {

    @Value("${farmsync.jwt.secret}")
    private String jwtSecret;

    @PostConstruct
    private void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 64) {
            throw new IllegalStateException(
                    "JWT_SECRET env var is missing or too short (need 64+ chars). Refusing to start.");
        }
    }

    private SecretKey getSigningKey() {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            byte[] bytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                byte[] padded = new byte[32];
                System.arraycopy(bytes, 0, padded, 0, bytes.length);
                return Keys.hmacShaKeyFor(padded);
            }
            return Keys.hmacShaKeyFor(bytes);
        }
    }

    public Claims getClaimsFromToken(String token) {
        SecretKey key = getSigningKey();
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public String getUserEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("email", String.class);
    }

    public String generateToken(org.springframework.security.core.Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return generateToken(user);
    }

    public String generateToken(User user) {
        SecretKey key = getSigningKey();

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + 86400000)) // 24 hours
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
