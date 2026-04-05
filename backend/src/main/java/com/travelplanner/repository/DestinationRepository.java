package com.travelplanner.repository;

import com.travelplanner.entity.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    Page<Destination> findByApprovedTrue(Pageable pageable);
    Page<Destination> findByApprovedTrueAndCountryNameContainingIgnoreCase(String countryName, Pageable pageable);
    List<Destination> findByApprovedTrue();
    Optional<Destination> findByCountryNameIgnoreCase(String countryName);
    boolean existsByCountryNameIgnoreCase(String countryName);
}
