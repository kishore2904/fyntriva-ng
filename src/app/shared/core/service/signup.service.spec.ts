import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { SignupRequest, SignupService, UserResponse } from './signup.service';

describe('SignupService', () => {
  let service: SignupService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignupService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SignupService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('posts signup data to the backend signup endpoint', () => {
    const request: SignupRequest = {
      firstName: 'Taylor',
      lastName: 'Morgan',
      email: 'taylor@example.com',
      password: 'StrongPass1!'
    };
    const response: UserResponse = {
      id: 1,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      role: 'USER',
      active: true,
      createdAt: '2026-10-24T00:00:00',
      updatedAt: '2026-10-24T00:00:00'
    };

    service.signup(request).subscribe(user => {
      expect(user).toEqual(response);
    });

    const httpRequest = httpTestingController.expectOne(
      `${environment.apiBaseUrl}/signup`
    );
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush(response);
  });
});
