package com.travelplanner.service;

import com.travelplanner.dto.*;
import com.travelplanner.dto.response.CountryApiResponse;
import com.travelplanner.dto.response.PageResponse;
import com.travelplanner.entity.Destination;
import com.travelplanner.mappers.DestinationMapper;
import com.travelplanner.repository.DestinationRepository;
import com.travelplanner.repository.WantToVisitRepository;
import com.travelplanner.util.RepositoryEntityFinder;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final WantToVisitRepository wantToVisitRepository;
    private final RestCountriesService restCountriesService;
    private final DestinationMapper destinationMapper;

    public List<CountryApiResponse> fetchCountriesFromApi() {
        return restCountriesService.getAllCountries();
    }

    public List<CountryApiResponse> searchCountriesFromApi(String name) {
        return restCountriesService.searchByName(name);
    }

    @Transactional
    public DestinationDto addDestination(CountryApiResponse country) {
        String countryName = country.extractCountryName();

        if (destinationRepository.existsByCountryNameIgnoreCase(countryName)) {
            throw new IllegalArgumentException("Destination already exists: " + countryName);
        }

        Destination destination = buildDestinationFromApi(country);
        destination = destinationRepository.save(destination);
        return destinationMapper.toDto(destination, false);
    }

    @Transactional
    public List<DestinationDto> bulkAddDestinations(List<String> countryNames) {
        List<CountryApiResponse> allCountries = restCountriesService.getAllCountries();
        List<DestinationDto> added = new ArrayList<>();

        for (String name : countryNames) {
            if (destinationRepository.existsByCountryNameIgnoreCase(name)) {
                continue;
            }

            CountryApiResponse match = allCountries.stream()
                    .filter(c -> c.extractCountryName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElse(null);

            if (match != null) {
                Destination destination = buildDestinationFromApi(match);
                destination = destinationRepository.save(destination);
                added.add(destinationMapper.toDto(destination, false));
            }
        }

        return added;
    }

    @Transactional
    public void removeDestination(Long id) {
        RepositoryEntityFinder.findEntityByIdOrThrow(id, destinationRepository);
        destinationRepository.deleteById(id);
    }

    public List<DestinationDto> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(d -> destinationMapper.toDto(d, false))
                .collect(Collectors.toList());
    }

    public PageResponse<DestinationDto> getApprovedDestinations(int page, int size, String search, Long userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("countryName").ascending());
        Page<Destination> destinationPage;

        if (search != null && !search.isBlank()) {
            destinationPage = destinationRepository
                    .findByApprovedTrueAndCountryNameContainingIgnoreCase(search, pageable);
        } else {
            destinationPage = destinationRepository.findByApprovedTrue(pageable);
        }

        Set<Long> wantToVisitIds = Set.of();
        if (userId != null) {
            wantToVisitIds = wantToVisitRepository.findByUserId(userId).stream()
                    .map(w -> w.getDestination().getId())
                    .collect(Collectors.toSet());
        }

        Set<Long> finalWantToVisitIds = wantToVisitIds;
        List<DestinationDto> content = destinationPage.getContent().stream()
                .map(d -> destinationMapper.toDto(d, finalWantToVisitIds.contains(d.getId())))
                .collect(Collectors.toList());

        return PageResponse.<DestinationDto>builder()
                .content(content)
                .page(destinationPage.getNumber())
                .size(destinationPage.getSize())
                .totalElements(destinationPage.getTotalElements())
                .totalPages(destinationPage.getTotalPages())
                .last(destinationPage.isLast())
                .build();
    }

    public DestinationDto getDestinationById(Long id, Long userId) {
        Destination destination = RepositoryEntityFinder.findEntityByIdOrThrow(id, destinationRepository);

        boolean wantToVisit = false;
        if (userId != null) {
            wantToVisit = wantToVisitRepository.existsByUserIdAndDestinationId(userId, id);
        }

        return destinationMapper.toDto(destination, wantToVisit);
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
