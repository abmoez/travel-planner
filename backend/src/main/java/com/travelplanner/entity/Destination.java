package com.travelplanner.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destination")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String countryName;

    private String capital;

    private String region;

    private String subregion;

    private Long population;

    private String currency;

    private String flagUrl;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private boolean approved;

    @OneToMany(mappedBy = "destination", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<WantToVisit> wantToVisits;
}
