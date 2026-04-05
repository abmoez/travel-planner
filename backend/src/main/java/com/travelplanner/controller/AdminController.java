package com.travelplanner.controller;

import com.travelplanner.dto.DestinationDto;
import com.travelplanner.dto.request.BulkAddRequest;
import com.travelplanner.dto.response.CountryApiResponse;
import com.travelplanner.service.DestinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DestinationService destinationService;

    @GetMapping("/countries")
    public ResponseEntity<List<CountryApiResponse>> fetchAllCountries() {
        return ResponseEntity.ok(destinationService.fetchCountriesFromApi());
    }

    @GetMapping("/countries/search")
    public ResponseEntity<List<CountryApiResponse>> searchCountries(@RequestParam String name) {
        return ResponseEntity.ok(destinationService.searchCountriesFromApi(name));
    }

    @PostMapping("/destinations")
    public ResponseEntity<DestinationDto> addDestination(@RequestBody CountryApiResponse country) {
        return ResponseEntity.ok(destinationService.addDestination(country));
    }

    @PostMapping("/destinations/bulk")
    public ResponseEntity<List<DestinationDto>> bulkAdd(@Valid @RequestBody BulkAddRequest request) {
        return ResponseEntity.ok(destinationService.bulkAddDestinations(request.getCountryNames()));
    }

    @DeleteMapping("/destinations/{id}")
    public ResponseEntity<Void> removeDestination(@PathVariable Long id) {
        destinationService.removeDestination(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/destinations")
    public ResponseEntity<List<DestinationDto>> getAllDestinations() {
        return ResponseEntity.ok(destinationService.getAllDestinations());
    }
}
