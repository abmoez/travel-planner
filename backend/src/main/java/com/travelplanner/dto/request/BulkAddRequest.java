package com.travelplanner.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkAddRequest {

    @NotEmpty(message = "Country names list cannot be empty")
    private List<String> countryNames;
}
