import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';
import { environment } from '../../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('adds the bearer token to protected API requests', () => {
    establishSession();
    expect(authService.accessToken).toBe('test-token');

    http.get(`${environment.apiBaseUrl}/workouts`).subscribe();
    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/workouts`
    );

    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);
  });

  it('does not add a token to the public login request', () => {
    http.post(`${environment.apiBaseUrl}/auth/login`, {
      email: 'athlete@example.com',
      password: 'test-password'
    }).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/login`
    );

    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ accessToken: 'test-token' });
  });

  it('does not add a bearer token to the public refresh request', () => {
    establishSession();

    http.post(`${environment.apiBaseUrl}/auth/refresh`, {}).subscribe();
    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    );

    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ accessToken: 'renewed-token' });
  });

  it('refreshes and retries a protected request on 401', () => {
    establishSession();
    const response = {
      accessToken: 'refreshed-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 1,
        firstName: 'Taylor',
        lastName: 'Morgan',
        email: 'athlete@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    };
    let responseBody: unknown;
    http.get(`${environment.apiBaseUrl}/workouts`).subscribe({
      next: body => responseBody = body
    });

    const initialRequest = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/workouts`
    );
    expect(initialRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    initialRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    );
    expect(refreshRequest.request.method).toBe('POST');
    expect(refreshRequest.request.withCredentials).toBeTrue();
    refreshRequest.flush(response);

    const retriedRequest = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/workouts`
    );
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    retriedRequest.flush([{ id: 1 }]);

    expect(responseBody).toEqual([{ id: 1 }]);
    expect(authService.isAuthenticated).toBeTrue();
    expect(authService.accessToken).toBe('refreshed-token');
  });

  it('clears the session and redirects if refresh fails', () => {
    establishSession();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    http.get(`${environment.apiBaseUrl}/workouts`).subscribe({
      error: () => undefined
    });
    httpTestingController.expectOne(
      `${environment.apiBaseUrl}/workouts`
    ).flush({}, { status: 401, statusText: 'Unauthorized' });

    httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    ).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.isAuthenticated).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  function establishSession(): void {
    authService.login({
      email: 'athlete@example.com',
      password: 'test-password'
    }).subscribe();

    httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/login`
    ).flush({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 1,
        firstName: 'Taylor',
        lastName: 'Morgan',
        email: 'athlete@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    });
  }
});
