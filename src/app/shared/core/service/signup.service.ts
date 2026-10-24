import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private readonly signupUrl =
    `${environment.apiBaseUrl.replace(/\/+$/, '')}/signup`;

  constructor(private readonly http: HttpClient) {}

  signup(request: SignupRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.signupUrl, request);
  }
}
