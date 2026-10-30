import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('authenticates using the configured endpoint and stores the returned session in memory', () => {
    authService.login({ email: 'user@user.com', password: '12345678' }).subscribe();

    const request = httpTestingController.expectOne(`${environment.API_BASE_URL}auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'user@user.com', password: '12345678' });
    expect(request.request.headers.has('Authorization')).toBeFalse();

    request.flush({
      token: 'test-token',
      name: 'Alex Smith',
      email: 'user@user.com',
      role: 'user',
      seniority: 'senior',
    });

    expect(authService.token()).toBe('test-token');
    expect(authService.user()).toEqual({
      name: 'Alex Smith',
      email: 'user@user.com',
      role: 'user',
      seniority: 'senior',
    });
  });

  it('adds the in-memory token to subsequent API requests and clears it on logout', () => {
    authService.login({ email: 'user@user.com', password: '12345678' }).subscribe();
    httpTestingController.expectOne(`${environment.API_BASE_URL}auth/login`).flush({
      token: 'test-token',
      name: 'Alex Smith',
      seniority: 'senior',
    });

    TestBed.inject(HttpClient).get(`${environment.API_BASE_URL}employees`).subscribe();

    const request = httpTestingController.expectOne(`${environment.API_BASE_URL}employees`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);

    authService.logout();
    expect(authService.token()).toBeNull();
    expect(authService.user()).toBeNull();
  });

  it('rejects malformed login responses without establishing a session', () => {
    let receivedError: unknown;
    authService
      .login({ email: 'user@user.com', password: '12345678' })
      .subscribe({ error: (error: unknown) => (receivedError = error) });

    httpTestingController
      .expectOne(`${environment.API_BASE_URL}auth/login`)
      .flush({ token: 'test-token', name: 'Alex Smith' });

    expect(receivedError).toEqual(jasmine.any(Error));
    expect(authService.token()).toBeNull();
    expect(authService.user()).toBeNull();
  });
});
