package com.example.photoalbum.security;

import com.example.photoalbum.model.AuthProvider;
import com.example.photoalbum.model.User;
import com.example.photoalbum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = resolveProvider(registrationId);

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        if (name == null || name.isBlank()) {
            name = oidcUser.getAttribute("name");
        }
        if (name == null || name.isBlank()) {
            name = email;
        }
        String providerId = oidcUser.getSubject();

        Optional<User> existingByProvider = userRepository.findByProviderAndProviderId(provider, providerId);
        if (existingByProvider.isPresent()) {
            User user = existingByProvider.get();
            user.setName(name);
            userRepository.save(user);
            return oidcUser;
        }

        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
            if (existing.getProvider() != provider) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("email_already_exists"),
                        "이 이메일은 이미 " + existing.getProvider() + " 계정으로 가입되어 있습니다."
                );
            }
        }

        User user = existingByEmail.orElseGet(User::new);
        user.setEmail(email);
        user.setName(name);
        user.setProvider(provider);
        user.setProviderId(providerId);
        userRepository.save(user);

        return oidcUser;
    }

    private AuthProvider resolveProvider(String registrationId) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> AuthProvider.GOOGLE;
            case "apple" -> AuthProvider.APPLE;
            default -> throw new OAuth2AuthenticationException(
                    new OAuth2Error("unknown_provider"),
                    "지원하지 않는 OAuth2 공급자입니다: " + registrationId
            );
        };
    }
}
