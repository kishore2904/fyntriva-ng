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
        loadComponent: () => import('./feature/home/home.component').then(m => m.HomeComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./feature/home/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'workouts',
                loadComponent: () => import('./feature/home/workouts/workouts.component')
                    .then(m => m.WorkoutsComponent)
            },
            {
                path: 'progress',
                loadComponent: () => import('./feature/home/progress/progress.component')
                    .then(m => m.ProgressComponent)
            },
            {
                path: 'missions',
                loadComponent: () => import('./feature/home/missions/missions.component')
                    .then(m => m.MissionsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./feature/home/profile/profile.component')
                    .then(m => m.ProfileComponent)
            }
        ]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }

];
