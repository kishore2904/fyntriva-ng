import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';

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
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.setTheme(this.themeService.isDarkTheme());

    this.signupForm = this.fb.group(
      {
        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u)
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

  get fullName() {
    return this.signupForm.get('fullName');
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

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.signupForm.getRawValue();

    const signupRequest = {
      fullName: fullName.trim(),
      email: email.trim(),
      password
    };

    // Next step: send signupRequest to the Spring Boot API.
    console.log('Signup form is valid:', {
      ...signupRequest,
      password: '[REDACTED]'
    });
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    this.themeService.setDarkTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
  }
}