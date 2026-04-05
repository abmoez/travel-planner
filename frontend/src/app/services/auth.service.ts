import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly ROLE_KEY = 'auth_role';

  private currentUser = signal<string | null>(this.getStoredUser());
  private currentRole = signal<string | null>(this.getStoredRole());

  isLoggedIn = computed(() => !!this.currentUser());
  username = computed(() => this.currentUser());
  role = computed(() => this.currentRole());
  isAdmin = computed(() => this.currentRole() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.currentUser.set(null);
    this.currentRole.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, response.username);
    localStorage.setItem(this.ROLE_KEY, response.role);
    this.currentUser.set(response.username);
    this.currentRole.set(response.role);
  }

  private getStoredUser(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  private getStoredRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
}
