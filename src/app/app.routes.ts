import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./feature/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }

];
