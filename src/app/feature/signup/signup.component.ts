import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';
import { SignupRequest, SignupService } from '../../shared/core/service/signup.service';

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  isDarkTheme = false;
  submitted = false;
  isSubmitting = false;
  signupErrorMessage = '';
  signupSuccessMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private signupService: SignupService
  ) {}

  ngOnInit(): void {
    this.setTheme(this.themeService.isDarkTheme());

    this.signupForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(NAME_PATTERN)
          ]
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(NAME_PATTERN)
          ]
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.maxLength(254)
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/
            )
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  get firstName() {
    return this.signupForm.get('firstName');
  }

  get lastName() {
    return this.signupForm.get('lastName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get passwordStrength(): number {
    const value = this.password?.value ?? '';
    let score = 0;

    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9\s]/.test(value)) score++;

    return score;
  }

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSignup(): void {
    this.submitted = true;

    if (
      this.signupForm.invalid ||
      this.isSubmitting ||
      this.signupSuccessMessage
    ) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password } =
      this.signupForm.getRawValue();
    const request: SignupRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password
    };

    this.signupErrorMessage = '';
    this.isSubmitting = true;

    this.signupService.signup(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.signupSuccessMessage =
          'Your account was created successfully. You can now sign in.';
        this.signupForm.reset();
        this.signupForm.disable();
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.signupErrorMessage = this.getSignupErrorMessage(error);
      }
    });
  }

  private getSignupErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Account creation failed. Please try again later.';
    }

    if (error.status === 0) {
      return 'Unable to reach the signup service. Check your connection and try again.';
    }

    const responseMessage = this.getResponseMessage(error.error);
    if (
      error.status === 409 ||
      /already exists|already registered|duplicate|email.{0,30}(exists|registered|taken)|unique constraint/i
        .test(responseMessage)
    ) {
      return 'An account with this email address already exists.';
    }

    if (error.status === 400) {
      return 'The signup details were rejected. Check your information and try again.';
    }

    return 'Account creation failed. Please try again later.';
  }

  private getResponseMessage(body: unknown): string {
    if (typeof body === 'string') {
      return body;
    }

    if (body && typeof body === 'object') {
      const response = body as Record<string, unknown>;
      return [response['message'], response['error'], response['detail']]
        .filter((value): value is string => typeof value === 'string')
        .join(' ');
    }

    return '';
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    this.themeService.setDarkTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
  }
}