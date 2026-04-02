package com.farmsync.security;

import com.farmsync.model.User;
import com.farmsync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        return processOAuth2User(oAuth2UserRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        if (email == null) {
            // Microsoft might use "preferred_username" or "mail"
            email = (String) attributes.get("preferred_username");
        }
        
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            updateExistingUser(userOptional.get(), attributes);
        } else {
            registerNewUser(oAuth2UserRequest, attributes, email);
        }

        return oAuth2User;
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, Map<String, Object> attributes, String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setName((String) attributes.getOrDefault("name", "OAuth User"));
        user.setRole("farmer"); // Default role
        user.setPictureUrl((String) attributes.get("picture")); // Google uses "picture"
        if (user.getPictureUrl() == null) {
            // Microsoft might use something else or none
        }
        user.setPassword(""); // No password for OAuth users
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, Map<String, Object> attributes) {
        existingUser.setName((String) attributes.getOrDefault("name", existingUser.getName()));
        String picture = (String) attributes.get("picture");
        if (picture != null) {
            existingUser.setPictureUrl(picture);
        }
        return userRepository.save(existingUser);
    }
}
