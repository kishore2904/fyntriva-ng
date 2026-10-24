import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/core/service/theme.service';
import { AuthService } from '../../shared/core/service/auth.service';

interface Mission {
  title: string;
  description: string;
  xp: number;
  progress: number;
  target: number;
  icon: string;
}

interface WorkoutActivity {
  name: string;
  details: string;
  duration: string;
  xp: number;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isDarkTheme = false;

  userLevel = 8;
  currentXp = 720;
  nextLevelXp = 1000;
  weeklyWorkouts = 4;
  weeklyWorkoutGoal = 5;
  streakDays = 6;
  weeklyMinutes = 185;

  activeNav = 'Dashboard';
  workoutStarted = false;
  logoutErrorMessage = '';

  today = new Date();

  readonly navigation = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Workouts', icon: '▤' },
    { label: 'Progress', icon: '↗' },
    { label: 'Missions', icon: '⚑' },
    { label: 'Profile', icon: '♙' }
  ];

  readonly week = [
    { day: 'Mon', minutes: 35 },
    { day: 'Tue', minutes: 50 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: 25 },
    { day: 'Sat', minutes: 30 },
    { day: 'Sun', minutes: 0 }
  ];

  readonly missions: Mission[] = [
    {
      title: 'Consistency is key',
      description: 'Complete 5 workouts this week',
      xp: 100,
      progress: 4,
      target: 5,
      icon: '🎯'
    },
    {
      title: 'Keep moving',
      description: 'Reach 200 active minutes',
      xp: 75,
      progress: 185,
      target: 200,
      icon: '⚡'
    },
    {
      title: 'Early bird',
      description: 'Complete 3 morning workouts',
      xp: 50,
      progress: 2,
      target: 3,
      icon: '🌅'
    }
  ];

  readonly recentActivities: WorkoutActivity[] = [
    {
      name: 'Upper Body Strength',
      details: 'Chest, shoulders & triceps',
      duration: '45 min',
      xp: 85,
      icon: '💪'
    },
    {
      name: 'Leg Day',
      details: 'Quads, hamstrings & calves',
      duration: '50 min',
      xp: 100,
      icon: '🦵'
    },
    {
      name: 'Pull Day',
      details: 'Back & biceps',
      duration: '40 min',
      xp: 80,
      icon: '🏋️'
    }
  ];

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  get userName(): string {
    return this.authService.currentUser?.firstName || 'Athlete';
  }

  get xpProgress(): number {
    if (this.nextLevelXp <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((this.currentXp / this.nextLevelXp) * 100)
    );
  }

  get weeklyProgress(): number {
    return Math.min(
      100,
      Math.round((this.weeklyWorkouts / this.weeklyWorkoutGoal) * 100)
    );
  }

  get weeklyMinutesProgress(): number {
    return Math.min(100, Math.round((this.weeklyMinutes / 200) * 100));
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

  selectNav(label: string): void {
    this.activeNav = label;
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    this.themeService.setDarkTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
  }

  startWorkout(): void {
    // Replace with navigation to the real workout session page.
    this.workoutStarted = true;
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
}