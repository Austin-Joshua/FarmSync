package com.farmsync.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (first, second) -> first
                ));

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Bad Request");
        body.put("message", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid email or password");
        errors.put("error", "Forbidden");
        return new ResponseEntity<>(errors, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        String message = ex.getMessage();
        errors.put("message", message);
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if ("User not found".equals(message) ||
            "Farm not found".equals(message) ||
            "Crop not found".equals(message) ||
            "Expense not found".equals(message) ||
            "Stock item not found".equals(message) ||
            "Yield record not found".equals(message) ||
            "Disease scan not found".equals(message)) {
            status = HttpStatus.NOT_FOUND;
        } else if ("Email already exists".equals(message) || 
                   "User with this email already exists".equals(message) ||
                   "Email is required".equals(message) ||
                   "Phone number is required".equals(message) ||
                   "Phone and OTP are required".equals(message) ||
                   "Valid token and password (min 8 chars) required".equals(message) ||
                   "Invalid password reset token".equals(message) ||
                   "Password reset token expired".equals(message)) {
            status = HttpStatus.BAD_REQUEST;
        } else if ("Unauthorized access".equals(message)) {
            status = HttpStatus.FORBIDDEN;
        } else if ("Invalid email or password".equals(message) ||
                   "Invalid OTP".equals(message) ||
                   "OTP expired".equals(message) ||
                   "Invalid refresh token".equals(message) ||
                   "Refresh token expired".equals(message)) {
            status = HttpStatus.UNAUTHORIZED;
        }
        
        errors.put("error", status.getReasonPhrase());
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        errors.put("error", "Internal Server Error");
        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
