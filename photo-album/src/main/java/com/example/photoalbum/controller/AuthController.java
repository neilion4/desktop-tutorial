package com.example.photoalbum.controller;

import com.example.photoalbum.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @GetMapping("/login")
    public String loginPage(Model model) {
        List<String> oauthProviders = new ArrayList<>();
        if (clientRegistrationRepository != null) {
            for (String id : List.of("google", "apple")) {
                try {
                    if (clientRegistrationRepository.findByRegistrationId(id) != null) {
                        oauthProviders.add(id);
                    }
                } catch (Exception ignored) {
                }
            }
        }
        model.addAttribute("oauthProviders", oauthProviders);
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            RedirectAttributes redirectAttributes) {
        try {
            userService.register(email, password, name);
            return "redirect:/login?registered";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        }
    }
}
