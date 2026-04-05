package com.travelplanner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class BlockedCountriesConfig {

    private final Set<String> blockedCountries;

    public BlockedCountriesConfig(
            @Value("${app.blocked-countries:}") List<String> blockedCountries) {
        this.blockedCountries = blockedCountries.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isBlocked(String countryName) {
        return countryName != null && blockedCountries.contains(countryName.toLowerCase());
    }

    public Set<String> getBlockedCountries() {
        return blockedCountries;
    }
}
