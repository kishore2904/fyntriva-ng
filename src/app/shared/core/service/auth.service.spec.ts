import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('posts credentials and exposes the authenticated user and token', () => {
    const request = {
      email: 'arun.kumar@example.com',
      password: 'test-password'
    };
    const response = {
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 2,
        firstName: 'Arun',
        lastName: 'Kumar',
        email: request.email,
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    };

    service.login(request).subscribe();

    const httpRequest = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/login`
    );
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush(response);

    expect(service.isAuthenticated).toBeTrue();
    expect(service.accessToken).toBe('test-token');
    expect(service.currentUser?.firstName).toBe('Arun');
  });

  it('clears the user session on logout', () => {
    service.login({
      email: 'arun.kumar@example.com',
      password: 'test-password'
    }).subscribe();

    httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/login`
    ).flush({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 2,
        firstName: 'Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    });

    service.logout();

    expect(service.isAuthenticated).toBeFalse();
    expect(service.currentUser).toBeNull();
    expect(sessionStorage.getItem('fyntriva-auth-session')).toBeNull();
  });

  it('renews the access token using the HttpOnly refresh cookie', () => {
    const refresh = service.refreshSession();
    let renewedToken = '';
    refresh.subscribe(response => {
      renewedToken = response.accessToken;
    });

    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({
      accessToken: 'renewed-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 2,
        firstName: 'Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    });

    expect(renewedToken).toBe('renewed-token');
    expect(service.accessToken).toBe('renewed-token');
  });

  it('restores a missing session through the refresh endpoint', () => {
    let authenticated = false;
    service.ensureSession().subscribe(result => {
      authenticated = result;
    });

    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    );
    request.flush({
      accessToken: 'restored-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 2,
        firstName: 'Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    });

    expect(authenticated).toBeTrue();
    expect(service.accessToken).toBe('restored-token');
  });

  it('rejects session restoration when the refresh cookie is invalid', () => {
    let authenticated = true;
    service.ensureSession().subscribe(result => {
      authenticated = result;
    });

    httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    ).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authenticated).toBeFalse();
    expect(service.isAuthenticated).toBeFalse();
  });

  it('shares one refresh request when multiple callers refresh concurrently', () => {
    let completedCalls = 0;
    service.refreshSession().subscribe();
    service.refreshSession().subscribe(() => completedCalls++);

    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/refresh`
    );
    request.flush({
      accessToken: 'renewed-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 2,
        firstName: 'Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@example.com',
        role: 'USER',
        active: true,
        createdAt: '2026-10-24T19:51:27',
        updatedAt: '2026-10-24T19:51:27'
      }
    });

    expect(completedCalls).toBe(1);
  });

  it('calls the backend logout endpoint with credentials', () => {
    service.logoutFromServer().subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/auth/logout`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    request.flush(null);
  });
});
