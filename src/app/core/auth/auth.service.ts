import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from './login-response';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseLoginResponse(value: unknown): LoginResponse {
  if (
    !isRecord(value) ||
    typeof value['token'] !== 'string' ||
    !value['token'].trim() ||
    typeof value['name'] !== 'string' ||
    typeof value['seniority'] !== 'string'
  ) {
    throw new Error('The authentication response did not contain valid token and user details.');
  }

  return {
    token: value['token'],
    name: value['name'],
    seniority: value['seniority'],
    ...(typeof value['email'] === 'string' ? { email: value['email'] } : {}),
    ...(typeof value['role'] === 'string' ? { role: value['role'] } : {}),
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenState = signal<string | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly user = signal<Omit<LoginResponse, 'token'> | null>(null);

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<unknown>(`${environment.API_BASE_URL}auth/login`, credentials)
      .pipe(
        map(parseLoginResponse),
        tap((session) => {
          this.tokenState.set(session.token);
          const { token, ...user } = session;
          this.user.set(user);
        }),
      );
  }

  logout(): void {
    this.tokenState.set(null);
    this.user.set(null);
  }
}
