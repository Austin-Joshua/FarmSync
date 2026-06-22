package com.farmsync.security;

import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import java.io.IOException;
import java.util.Optional;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
            String idToken = header.substring(7);

            if (!com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                try {
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                    String email = decodedToken.getEmail();

                    if (email != null) {
                        Optional<User> userOptional = userRepository.findByEmail(email);
                        User user;
                        
                        if (userOptional.isPresent()) {
                            user = userOptional.get();
                        } else {
                            // Auto-create local user from Firebase token data
                            user = new User();
                            user.setId(java.util.UUID.randomUUID());
                            user.setEmail(email);
                            user.setName(decodedToken.getName() != null ? decodedToken.getName() : "Firebase User");
                            user.setRole("farmer"); // Default role
                            user = userRepository.save(user);
                            System.out.println("Auto-created local user record for: " + email);
                        }
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user, null, java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }

                } catch (Exception e) {
                    // If token is invalid, we don't set the authentication and let the security config handle it
                    System.err.println("Firebase authentication failed: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
