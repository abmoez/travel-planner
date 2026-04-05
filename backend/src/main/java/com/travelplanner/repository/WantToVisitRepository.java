package com.travelplanner.repository;

import com.travelplanner.entity.WantToVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WantToVisitRepository extends JpaRepository<WantToVisit, Long> {
    List<WantToVisit> findByUserId(Long userId);
    Optional<WantToVisit> findByUserIdAndDestinationId(Long userId, Long destinationId);
    boolean existsByUserIdAndDestinationId(Long userId, Long destinationId);
    void deleteByUserIdAndDestinationId(Long userId, Long destinationId);
}
