package com.travelplanner.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.dto.response.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .status(401)
                .message("Unauthorized: " + authException.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        objectMapper.findAndRegisterModules();
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
