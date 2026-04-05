package com.travelplanner.service;

import com.travelplanner.dto.request.LoginRequest;
import com.travelplanner.dto.request.RegisterRequest;
import com.travelplanner.dto.response.AuthResponse;
import com.travelplanner.entity.User;
import com.travelplanner.enums.Role;
import com.travelplanner.repository.UserRepository;
import com.travelplanner.security.CustomUserDetails;
import com.travelplanner.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        Role role = Role.USER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            role = Role.ADMIN;
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = tokenProvider.generateToken(auth);
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();

        return AuthResponse.builder()
                .token(token)
                .username(details.getUsername())
                .role(details.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = tokenProvider.generateToken(auth);
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();

        return AuthResponse.builder()
                .token(token)
                .username(details.getUsername())
                .role(details.getRole())
                .build();
    }
}
