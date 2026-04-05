package com.travelplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "want_to_visit", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "destination_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WantToVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;
}
