export interface Destination {
  id: number;
  countryName: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  currency: string;
  flagUrl: string;
  latitude: number | null;
  longitude: number | null;
  approved: boolean;
  wantToVisit: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CountryApiResponse {
  name: { common: string; official: string };
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  currencies: Record<string, { name: string; symbol: string }>;
  flags: { png: string; svg: string };
  latlng: number[];
}

export interface BulkAddRequest {
  countryNames: string[];
}
