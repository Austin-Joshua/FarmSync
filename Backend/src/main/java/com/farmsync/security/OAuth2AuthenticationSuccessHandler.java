package com.farmsync.security;

import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Value("${farmsync.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        if (email == null) {
            email = (String) attributes.get("preferred_username");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            String token = jwtUtils.generateToken(userOptional.get());
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("token", token)
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Should not happen as CustomOAuth2UserService creates the user
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found after OAuth2 login");
        }
    }
}
