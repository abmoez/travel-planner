import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BulkAddRequest, CountryApiResponse, Destination, PageResponse } from '../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {

  constructor(private http: HttpClient) {}

  getApprovedDestinations(page: number, size: number, search?: string): Observable<PageResponse<Destination>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<Destination>>(`${environment.apiUrl}/destinations`, { params });
  }

  getDestinationById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${environment.apiUrl}/destinations/${id}`);
  }

  toggleWantToVisit(id: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/destinations/${id}/want-to-visit`, {});
  }

  getWantToVisitList(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${environment.apiUrl}/destinations/want-to-visit`);
  }

  // Admin endpoints
  fetchAllCountries(): Observable<CountryApiResponse[]> {
    return this.http.get<CountryApiResponse[]>(`${environment.apiUrl}/admin/countries`);
  }

  searchCountries(name: string): Observable<CountryApiResponse[]> {
    return this.http.get<CountryApiResponse[]>(`${environment.apiUrl}/admin/countries/search`, {
      params: new HttpParams().set('name', name)
    });
  }

  addDestination(country: CountryApiResponse): Observable<Destination> {
    return this.http.post<Destination>(`${environment.apiUrl}/admin/destinations`, country);
  }

  bulkAddDestinations(request: BulkAddRequest): Observable<Destination[]> {
    return this.http.post<Destination[]>(`${environment.apiUrl}/admin/destinations/bulk`, request);
  }

  removeDestination(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/destinations/${id}`);
  }

  getAllDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${environment.apiUrl}/admin/destinations`);
  }
}
