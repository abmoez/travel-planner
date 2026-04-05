package com.travelplanner.controller;

import com.travelplanner.dto.DestinationDto;
import com.travelplanner.dto.response.PageResponse;
import com.travelplanner.security.CustomUserDetails;
import com.travelplanner.service.DestinationService;
import com.travelplanner.service.WantToVisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;
    private final WantToVisitService wantToVisitService;

    @GetMapping
    public ResponseEntity<PageResponse<DestinationDto>> getDestinations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                destinationService.getApprovedDestinations(page, size, search, userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationDto> getDestination(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(destinationService.getDestinationById(id, userDetails.getId()));
    }

    @PostMapping("/{id}/want-to-visit")
    public ResponseEntity<Void> toggleWantToVisit(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wantToVisitService.toggleWantToVisit(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/want-to-visit")
    public ResponseEntity<List<DestinationDto>> getWantToVisitList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(wantToVisitService.getWantToVisitList(userDetails.getId()));
    }
}
