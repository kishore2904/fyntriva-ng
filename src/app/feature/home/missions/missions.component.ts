import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="empty-section panel">
      <div class="empty-icon">⚑</div>
      <p class="eyebrow">SMALL STEPS. BIG RESULTS.</p>
      <h1>Missions</h1>
      <p>Your daily and weekly fitness missions will appear here.</p>
      <a class="primary-button" routerLink="/home/dashboard">
        Back to dashboard <span>→</span>
      </a>
    </section>
  `
})
export class MissionsComponent {
}
