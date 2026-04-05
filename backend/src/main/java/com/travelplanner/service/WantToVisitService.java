package com.travelplanner.service;

import com.travelplanner.dto.DestinationDto;
import com.travelplanner.entity.Destination;
import com.travelplanner.mappers.DestinationMapper;
import com.travelplanner.entity.User;
import com.travelplanner.entity.WantToVisit;
import com.travelplanner.repository.DestinationRepository;
import com.travelplanner.repository.UserRepository;
import com.travelplanner.repository.WantToVisitRepository;
import com.travelplanner.util.RepositoryEntityFinder;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WantToVisitService {

    private final WantToVisitRepository wantToVisitRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;

    @Transactional
    public void toggleWantToVisit(Long userId, Long destinationId) {
        User user = RepositoryEntityFinder.findEntityByIdOrThrow(userId, userRepository);
        Destination destination = RepositoryEntityFinder.findEntityByIdOrThrow(destinationId, destinationRepository);

        if (wantToVisitRepository.existsByUserIdAndDestinationId(userId, destinationId)) {
            wantToVisitRepository.deleteByUserIdAndDestinationId(userId, destinationId);
        } else {
            WantToVisit wantToVisit = WantToVisit.builder()
                    .user(user)
                    .destination(destination)
                    .build();
            wantToVisitRepository.save(wantToVisit);
        }
    }

    public List<DestinationDto> getWantToVisitList(Long userId) {
        return wantToVisitRepository.findByUserId(userId).stream()
                .map(w -> destinationMapper.toDto(w.getDestination(), true))
                .collect(Collectors.toList());
    }
}
