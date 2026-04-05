package com.travelplanner.mappers;

import com.travelplanner.dto.DestinationDto;
import com.travelplanner.entity.Destination;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DestinationMapper {

    DestinationDto toDto(Destination destination, boolean wantToVisit);
}
