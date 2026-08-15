import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return this.http.get<T>(`${this.apiBase}${path}`, { params: httpParams });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiBase}${path}`, body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiBase}${path}`, body ?? {});
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBase}${path}`);
  }

  upload<T>(path: string, form: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiBase}${path}`, form);
  }

  money(value: number | undefined | null): string {
    return (value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
