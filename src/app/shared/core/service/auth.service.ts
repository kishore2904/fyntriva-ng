import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  tap
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthSession,
  AuthenticatedUser,
  LoginRequest,
  LoginResponse
} from '../model/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly sessionStorageKey = 'fyntriva-auth-session';
  private readonly loginUrl =
    `${environment.apiBaseUrl.replace(/\/+$/, '')}/auth/login`;
  private readonly refreshUrl =
    `${environment.apiBaseUrl.replace(/\/+$/, '')}/auth/refresh`;
  private readonly logoutUrl =
    `${environment.apiBaseUrl.replace(/\/+$/, '')}/auth/logout`;
  private readonly session = signal<AuthSession | null>(this.restoreSession());
  private refreshInFlight$: Observable<LoginResponse> | null = null;

  constructor(private readonly http: HttpClient) {}

  get currentUser(): AuthenticatedUser | null {
    return this.session()?.user ?? null;
  }

  get accessToken(): string | null {
    return this.getActiveSession()?.accessToken ?? null;
  }

  get tokenType(): string | null {
    return this.getActiveSession()?.tokenType ?? null;
  }

  get isAuthenticated(): boolean {
    return this.getActiveSession() !== null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.loginUrl,
      request,
      { withCredentials: true }
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  refreshSession(): Observable<LoginResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.http.post<LoginResponse>(
      this.refreshUrl,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => this.saveSession(response)),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshInFlight$;
  }

  ensureSession(): Observable<boolean> {
    if (this.isAuthenticated) {
      return of(true);
    }

    if (!this.isBrowser) {
      return of(false);
    }

    return this.refreshSession().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  logoutFromServer(): Observable<void> {
    this.clearSession();
    return this.http.post<void>(
      this.logoutUrl,
      {},
      { withCredentials: true }
    );
  }

  clearSession(): void {
    this.session.set(null);

    if (this.isBrowser) {
      sessionStorage.removeItem(this.sessionStorageKey);
    }
  }

  private saveSession(response: LoginResponse): void {
    if (
      !response.accessToken ||
      !response.tokenType ||
      !Number.isFinite(response.expiresIn) ||
      response.expiresIn <= 0 ||
      !response.user
    ) {
      throw new Error('The login response did not contain a valid session.');
    }

    const session: AuthSession = {
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresAt: Date.now() + response.expiresIn * 1000,
      user: response.user
    };

    this.session.set(session);

    if (this.isBrowser) {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    }
  }

  private getActiveSession(): AuthSession | null {
    const session = this.session();
    return session && session.expiresAt > Date.now() ? session : null;
  }

  private restoreSession(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const storedSession = sessionStorage.getItem(this.sessionStorageKey);
    if (!storedSession) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(storedSession);
      if (this.isValidSession(parsed) && parsed.expiresAt > Date.now()) {
        return parsed;
      }
    } catch {
      sessionStorage.removeItem(this.sessionStorageKey);
      return null;
    }

    sessionStorage.removeItem(this.sessionStorageKey);
    return null;
  }

  private isValidSession(value: unknown): value is AuthSession {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const session = value as Partial<AuthSession>;
    const user = session.user;

    return typeof session.accessToken === 'string' &&
      typeof session.tokenType === 'string' &&
      typeof session.expiresAt === 'number' &&
      !!user &&
      typeof user.id === 'number' &&
      typeof user.firstName === 'string' &&
      typeof user.lastName === 'string' &&
      typeof user.email === 'string' &&
      typeof user.role === 'string' &&
      typeof user.active === 'boolean' &&
      typeof user.createdAt === 'string' &&
      typeof user.updatedAt === 'string';
  }
}
