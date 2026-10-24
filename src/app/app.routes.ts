import { Routes } from '@angular/router';
import { authGuard } from './shared/core/guard/auth.guard';

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
        canActivate: [authGuard],
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
