import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/usuario.model';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = `${API_URL}/auth`;
  private readonly TOKEN_KEY = 'tienda_token';
  private readonly USER_KEY = 'tienda_user';

  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(response => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(this.TOKEN_KEY, response.token);
          window.localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        }
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.TOKEN_KEY);
      window.localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getRol(): string {
    return this.getCurrentUser()?.rol ?? '';
  }

  hasRole(rol: string): boolean {
    return this.getRol() === rol;
  }

  private loadUser(): AuthResponse | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }
}
