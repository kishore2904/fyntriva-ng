import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';
import { AuthService } from '../../shared/core/service/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  

  showPassword: boolean = false;

  isDarkTheme: boolean = false;
  isSubmitting = false;
  loginErrorMessage = '';

  loginForm! : FormGroup;
  
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setTheme(this.themeService.isDarkTheme());

    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email,Validators.maxLength(254)]],
      password: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(128)]]
    })

  }


  onLogin(): void{
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.loginErrorMessage = '';
    this.isSubmitting = true;

    this.authService.login({
      email: email.trim(),
      password
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/home']);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.loginErrorMessage = this.getLoginErrorMessage(error);
      }
    });
  }

  private getLoginErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Login failed. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the login service. Check your connection and try again.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'The email or password is incorrect.';
    }

    return 'Login failed. Please try again later.';
  }

  togglePassword(): void{
    this.showPassword = !this.showPassword;

  }


setTheme(isDark: boolean): void {
  this.isDarkTheme = isDark;
  this.themeService.setDarkTheme(isDark);
}

toggleTheme(): void {
  this.setTheme(!this.isDarkTheme);
}

}
