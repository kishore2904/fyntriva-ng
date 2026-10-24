import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  it('allows a session restored by the auth service', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { ensureSession: () => of(true) } }
      ]
    });

    const result = await firstValueFrom(TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/home' } as never)
    ) as Observable<boolean | UrlTree>);

    expect(result).toBeTrue();
  });

  it('redirects when session restore fails', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { ensureSession: () => of(false) } }
      ]
    });

    const router = TestBed.inject(Router);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/home' } as never)
    ) as Observable<boolean | UrlTree>);

    expect(result).toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/home' }
      })
    );
  });
});
