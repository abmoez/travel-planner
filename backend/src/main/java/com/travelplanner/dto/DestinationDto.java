package com.travelplanner.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationDto {
    private Long id;
    private String countryName;
    private String capital;
    private String region;
    private String subregion;
    private Long population;
    private String currency;
    private String flagUrl;
    private Double latitude;
    private Double longitude;
    private boolean approved;
    private boolean wantToVisit;
}
