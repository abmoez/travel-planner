package com.travelplanner.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.dto.response.CountryApiResponse;
import com.travelplanner.entity.Destination;
import com.travelplanner.entity.User;
import com.travelplanner.enums.Role;
import com.travelplanner.repository.DestinationRepository;
import com.travelplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) {
        seedUsers();
        seedDestinations();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created (admin / admin123)");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.info("Default regular user created (user / user123)");
        }
    }

    private void seedDestinations() {
        if (destinationRepository.count() > 0) {
            log.info("Destinations already exist, skipping seed");
            return;
        }

        try (InputStream is = new ClassPathResource("seed-destinations.json").getInputStream()) {
            List<CountryApiResponse> countries = objectMapper.readValue(
                    is, new TypeReference<List<CountryApiResponse>>() {});

            List<Destination> destinations = countries.stream()
                    .map(this::buildDestinationFromApi)
                    .toList();

            destinationRepository.saveAll(destinations);
            log.info("Seeded {} destinations from seed-destinations.json", destinations.size());
        } catch (Exception e) {
            log.error("Failed to seed destinations: {}", e.getMessage(), e);
        }
    }

    private Destination buildDestinationFromApi(CountryApiResponse country) {
        return Destination.builder()
                .countryName(country.extractCountryName())
                .capital(country.extractCapital())
                .region(country.getRegion())
                .subregion(country.extractSubregion())
                .population(country.getPopulation())
                .currency(country.extractCurrency())
                .flagUrl(country.extractFlagUrl())
                .latitude(country.extractLatitude())
                .longitude(country.extractLongitude())
                .approved(true)
                .build();
    }
}
