import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../service/auth.service';

const API_BASE_URL = new URL(environment.apiBaseUrl, 'http://localhost');
const API_BASE_PATH = API_BASE_URL.pathname.replace(/\/+$/, '');
const LOGIN_PATH = `${API_BASE_PATH}/auth/login`;
const REFRESH_PATH = `${API_BASE_PATH}/auth/refresh`;
const LOGOUT_PATH = `${API_BASE_PATH}/auth/logout`;
const SIGNUP_PATH = `${API_BASE_PATH}/signup`;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requestUrl = new URL(request.url, API_BASE_URL);
  const isApiRequest =
    requestUrl.origin === API_BASE_URL.origin &&
    requestUrl.pathname.startsWith(`${API_BASE_PATH}/`);
  const isPublicAuthRequest =
    requestUrl.pathname === LOGIN_PATH ||
    requestUrl.pathname === REFRESH_PATH ||
    requestUrl.pathname === LOGOUT_PATH ||
    requestUrl.pathname === SIGNUP_PATH;
  const token = isApiRequest && !isPublicAuthRequest
    ? authService.accessToken
    : null;
  const authorizedRequest = token
    ? request.clone({
      setHeaders: {
        Authorization: `${authService.tokenType ?? 'Bearer'} ${token}`
      }
    })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isPublicAuthRequest
      ) {
        return authService.refreshSession().pipe(
          switchMap(() => {
            const refreshedToken = authService.accessToken;
            if (!refreshedToken) {
              throw new Error('Token refresh completed without an access token.');
            }

            return next(request.clone({
              setHeaders: {
                Authorization: `${authService.tokenType ?? 'Bearer'} ${refreshedToken}`
              }
            }));
          }),
          catchError(refreshError => {
            authService.clearSession();
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
