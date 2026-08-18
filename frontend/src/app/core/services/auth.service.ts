import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

const TOKEN_KEY = 'investpro_token';
const USER_KEY = 'investpro_user';

export interface LoginResponse {
  token?: string;
  user?: User;
  requires_2fa?: boolean;
  email?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  get user(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  register(payload: { name: string; email: string; password: string; password_confirmation: string; phone?: string; referral_code?: string }): Observable<{ token: string; user: User }> {
    return this.api.post<{ token: string; user: User }>('/register', payload).pipe(
      tap((res) => this.setSession(res.token, res.user)),
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/login', { email, password });
  }

  verify2FA(email: string, code: string): Observable<{ token: string; user: User }> {
    return this.api.post<{ token: string; user: User }>('/2fa/verify', { email, code }).pipe(
      tap((res) => this.setSession(res.token, res.user)),
    );
  }

  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/logout').pipe(tap(() => this.clearSession()));
  }

  me(): Observable<{ user: User }> {
    return this.api.get<{ user: User }>('/me').pipe(tap((res) => {
      this.setUser(res.user);
    }));
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.setUser(user);
  }

  private setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
