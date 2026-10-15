import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../shared/core/service/theme.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  isDarkTheme: boolean = false;
  

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.setTheme(this.themeService.isDarkTheme());
  }


  onLogin(): void{
    console.log('Logon button clicked');
  }

  togglePassword(): void{

  }


setTheme(isDark: boolean): void {
  this.isDarkTheme = isDark;
  this.themeService.setDarkTheme(isDark);
}

toggleTheme(): void {
  this.setTheme(!this.isDarkTheme);
}

}
