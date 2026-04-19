package com.example.photoalbum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.client.registration.CommonOAuth2Provider;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class OAuth2Config {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();

        String googleClientId = System.getenv("GOOGLE_CLIENT_ID");
        String googleClientSecret = System.getenv("GOOGLE_CLIENT_SECRET");
        if (googleClientId != null && !googleClientId.isBlank()
                && googleClientSecret != null && !googleClientSecret.isBlank()) {
            registrations.add(
                    CommonOAuth2Provider.GOOGLE.getBuilder("google")
                            .clientId(googleClientId)
                            .clientSecret(googleClientSecret)
                            .scope("openid", "email", "profile")
                            .build()
            );
        }

        String appleClientId = System.getenv("APPLE_CLIENT_ID");
        String appleClientSecret = System.getenv("APPLE_CLIENT_SECRET");
        if (appleClientId != null && !appleClientId.isBlank()
                && appleClientSecret != null && !appleClientSecret.isBlank()) {
            registrations.add(
                    ClientRegistration.withRegistrationId("apple")
                            .clientId(appleClientId)
                            .clientSecret(appleClientSecret)
                            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                            .authorizationUri("https://appleid.apple.com/auth/authorize")
                            .tokenUri("https://appleid.apple.com/auth/token")
                            .jwkSetUri("https://appleid.apple.com/auth/keys")
                            .userNameAttributeName(IdTokenClaimNames.SUB)
                            .scope("openid", "email", "name")
                            .clientName("Apple")
                            .build()
            );
        }

        if (registrations.isEmpty()) {
            return registrationId -> null;
        }

        return new InMemoryClientRegistrationRepository(registrations);
    }
}
