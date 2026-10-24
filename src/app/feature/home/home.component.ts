import { Component, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';
import { AuthService } from '../../shared/core/service/auth.service';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProfileComponent, RouterLink, RouterOutlet],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  isDarkTheme = false;
  isOnboardingVisible = false;
  onboardingStepIndex = 0;
  isFitnessProfileSetupVisible = false;
  profileStorageErrorMessage = '';
  private showProfileAfterTour = false;

  logoutErrorMessage = '';

  today = new Date();

  readonly navigation = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Workouts', icon: '▤' },
    { label: 'Progress', icon: '↗' },
    { label: 'Missions', icon: '⚑' },
    { label: 'Profile', icon: '♙' }
  ];

  readonly onboardingSteps = [
    {
      title: 'Your dashboard',
      description: 'See your fitness overview, weekly activity, and progress at a glance.'
    },
    {
      title: 'Your workouts',
      description: 'Find your workout plan here and use Start workout when you are ready to train.'
    },
    {
      title: 'Your goals',
      description: 'Missions help you build consistency. Complete them to track your progress and earn XP.'
    }
  ];

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkTheme();

    if (this.isBrowser) {
      if (!this.hasCompletedOnboarding()) {
        this.showProfileAfterTour = !this.hasDismissedProfileSetup();
        this.startOnboarding();
      } else if (!this.hasDismissedProfileSetup()) {
        this.isFitnessProfileSetupVisible = true;
      }
    }
  }

  get userName(): string {
    return this.authService.currentUser?.firstName || 'Athlete';
  }

  get greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
  }

  get formattedDate(): string {
    return this.today.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  get activeNav(): string {
    const route = this.router.url.split('?')[0].split('/').pop();
    switch (route) {
      case 'workouts': return 'Workouts';
      case 'progress': return 'Progress';
      case 'missions': return 'Missions';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  }

  selectNav(label: string): void {
    const route = label.toLowerCase();
    void this.router.navigate(['/home', route === 'dashboard' ? 'dashboard' : route]);
  }

  get onboardingStep() {
    return this.onboardingSteps[this.onboardingStepIndex];
  }

  get onboardingStorageKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId === undefined
      ? 'fyntriva-onboarding-complete'
      : `fyntriva-onboarding-complete-${userId}`;
  }

  get profileSetupDismissedStorageKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId === undefined
      ? 'fyntriva-profile-setup-dismissed'
      : `fyntriva-profile-setup-dismissed-${userId}`;
  }

  startOnboarding(): void {
    this.onboardingStepIndex = 0;
    this.isOnboardingVisible = true;
  }

  previousOnboardingStep(): void {
    if (this.onboardingStepIndex > 0) {
      this.onboardingStepIndex--;
    }
  }

  nextOnboardingStep(): void {
    if (this.onboardingStepIndex < this.onboardingSteps.length - 1) {
      this.onboardingStepIndex++;
      return;
    }

    this.finishOnboarding();
  }

  skipOnboarding(): void {
    this.finishOnboarding();
  }

  completeFitnessProfileSetup(): void {
    this.isFitnessProfileSetupVisible = false;
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    this.themeService.setDarkTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
  }

  logout(): void {
    this.logoutErrorMessage = '';
    this.authService.logoutFromServer().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => {
        this.logoutErrorMessage =
          'You were signed out on this device, but the server could not confirm sign-out.';
      }
    });
  }

  private hasCompletedOnboarding(): boolean {
    try {
      return localStorage.getItem(this.onboardingStorageKey) === 'true';
    } catch {
      this.profileStorageErrorMessage =
        'Browser storage is unavailable. Your onboarding and fitness profile may not be remembered.';
      return false;
    }
  }

  private hasDismissedProfileSetup(): boolean {
    try {
      return localStorage.getItem(this.profileSetupDismissedStorageKey) === 'true';
    } catch {
      this.profileStorageErrorMessage =
        'Browser storage is unavailable. Your onboarding and fitness profile may not be remembered.';
      return false;
    }
  }

  private finishOnboarding(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.onboardingStorageKey, 'true');
      } catch {
        this.profileStorageErrorMessage =
          'Browser storage is unavailable. Your onboarding progress may not be remembered.';
      }
    }

    this.isOnboardingVisible = false;
    if (this.showProfileAfterTour && !this.hasDismissedProfileSetup()) {
      this.isFitnessProfileSetupVisible = true;
    }
    this.showProfileAfterTour = false;
  }
}