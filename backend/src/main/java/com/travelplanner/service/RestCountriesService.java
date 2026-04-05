package com.travelplanner.service;

import com.travelplanner.dto.response.CountryApiResponse;
import com.travelplanner.exception.ExternalApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestCountriesService {

    private final RestTemplate restTemplate;

    @Value("${restcountries.api.base-url}")
    private String baseUrl;

    @Value("${restcountries.api.fields}")
    private String fields;

    public List<CountryApiResponse> getAllCountries() {
        String url = baseUrl + "/all?fields=" + fields;
        return fetchCountries(url);
    }

    public List<CountryApiResponse> searchByName(String name) {
        String url = baseUrl + "/name/" + name + "?fields=" + fields;
        return fetchCountries(url);
    }

    private List<CountryApiResponse> fetchCountries(String url) {
        try {
            ResponseEntity<List<CountryApiResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to fetch countries from REST Countries API: {}", e.getMessage());
            throw new ExternalApiException("Failed to fetch data from REST Countries API: " + e.getMessage());
        }
    }
}
