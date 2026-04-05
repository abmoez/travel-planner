package com.travelplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CountryApiResponse {

    private Name name;
    private List<String> capital;
    private String region;
    private String subregion;
    private Long population;
    private Map<String, CurrencyInfo> currencies;
    private Flags flags;
    private List<Double> latlng;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Name {
        private String common;
        private String official;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CurrencyInfo {
        private String name;
        private String symbol;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Flags {
        private String png;
        private String svg;
    }

    public String extractCountryName() {
        return name != null ? name.getCommon() : "Unknown";
    }

    public String extractCapital() {
        return (capital != null && !capital.isEmpty()) ? capital.get(0) : "N/A";
    }

    public String extractCurrency() {
        if (currencies == null || currencies.isEmpty()) {
            return "N/A";
        }
        Map.Entry<String, CurrencyInfo> first = currencies.entrySet().iterator().next();
        String code = first.getKey();
        String currencyName = first.getValue().getName();
        return currencyName + " (" + code + ")";
    }

    public String extractFlagUrl() {
        return flags != null ? flags.getPng() : "";
    }

    public String extractSubregion() {
        return subregion != null ? subregion : "";
    }

    public Double extractLatitude() {
        return (latlng != null && latlng.size() >= 2) ? latlng.get(0) : null;
    }

    public Double extractLongitude() {
        return (latlng != null && latlng.size() >= 2) ? latlng.get(1) : null;
    }

    public boolean hasValidCoordinates() {
        return extractLatitude() != null && extractLongitude() != null;
    }
}
