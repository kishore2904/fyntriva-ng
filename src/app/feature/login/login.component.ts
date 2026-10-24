import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  

  showPassword: boolean = false;

  isDarkTheme: boolean = false;

  loginForm! : FormGroup;
  
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  constructor(
    private fb : FormBuilder,private themeService: ThemeService) {}

  ngOnInit(): void {
    this.setTheme(this.themeService.isDarkTheme());

    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email,Validators.maxLength(254)]],
      password: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(128)]]
    })

  }


  onLogin(): void{
    if(this.loginForm.valid){
    console.log('Logon button clicked');
    }
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
