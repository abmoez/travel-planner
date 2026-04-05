package com.travelplanner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
public class BlockedCountriesConfig {

    @Value("${app.blocked-countries}")
    private String blockedCountriesString;

    private Set<String> blockedCountries;

    @PostConstruct
    public void init() {
        this.blockedCountries = Stream.of(this.blockedCountriesString.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(String::toLowerCase)
            .collect(Collectors.toSet());   
    }

    public boolean isBlocked(String countryName) {
        return countryName != null && blockedCountries.contains(countryName.toLowerCase());
    }

    public Set<String> getBlockedCountries() {
        return blockedCountries;
    }
}
