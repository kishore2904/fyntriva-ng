import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./feature/login/login.component').then(m => m.LoginComponent)
    },

    {
        path: 'sign-up',
        loadComponent: () =>
            import('./feature/signup/signup.component')
                .then(m => m.SignupComponent)
    },
    {
        path: 'home',
        loadComponent: () =>
            import('./feature/home/home.component')
                .then(m => m.HomeComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }

];
