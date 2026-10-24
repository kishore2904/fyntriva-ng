import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/core/service/auth.service';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  constructor(private readonly authService: AuthService) {}

  get userName(): string {
    return this.authService.currentUser?.firstName || 'Athlete';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  userLevel = 8;
  currentXp = 720;
  nextLevelXp = 1000;
  weeklyWorkouts = 4;
  weeklyWorkoutGoal = 5;
  streakDays = 6;
  weeklyMinutes = 185;
  workoutStarted = false;

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
    { title: 'Consistency is key', description: 'Complete 5 workouts this week', xp: 100, progress: 4, target: 5, icon: '🎯' },
    { title: 'Keep moving', description: 'Reach 200 active minutes', xp: 75, progress: 185, target: 200, icon: '⚡' },
    { title: 'Early bird', description: 'Complete 3 morning workouts', xp: 50, progress: 2, target: 3, icon: '🌅' }
  ];

  readonly recentActivities: WorkoutActivity[] = [
    { name: 'Upper Body Strength', details: 'Chest, shoulders & triceps', duration: '45 min', xp: 85, icon: '💪' },
    { name: 'Leg Day', details: 'Quads, hamstrings & calves', duration: '50 min', xp: 100, icon: '🦵' },
    { name: 'Pull Day', details: 'Back & biceps', duration: '40 min', xp: 80, icon: '🏋️' }
  ];

  get xpProgress(): number {
    return this.nextLevelXp <= 0 ? 0 : Math.min(100, Math.round(this.currentXp / this.nextLevelXp * 100));
  }

  get weeklyProgress(): number {
    return Math.min(100, Math.round(this.weeklyWorkouts / this.weeklyWorkoutGoal * 100));
  }

  get weeklyMinutesProgress(): number {
    return Math.min(100, Math.round(this.weeklyMinutes / 200 * 100));
  }

  startWorkout(): void {
    this.workoutStarted = true;
  }
}
