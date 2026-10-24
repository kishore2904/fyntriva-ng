import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="empty-section panel">
      <div class="empty-icon">▤</div>
      <p class="eyebrow">YOUR TRAINING</p>
      <h1>Workouts</h1>
      <p>Your workout plans and training sessions will appear here.</p>
      <a class="primary-button" routerLink="/home/dashboard">
        Back to dashboard <span>→</span>
      </a>
    </section>
  `
})
export class WorkoutsComponent {
}
