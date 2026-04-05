package com.travelplanner.util;

import com.travelplanner.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

public final class RepositoryEntityFinder {

    private RepositoryEntityFinder() {}

    public static <T> T findEntityByIdOrThrow(Long id, JpaRepository<T, Long> repository) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(
                                "%s not found with id: %d",
                                repository.getClass().getSimpleName().toLowerCase().replace("repository", ""),
                                id)));
    }
}
