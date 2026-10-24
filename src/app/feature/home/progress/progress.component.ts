import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="empty-section panel">
      <div class="empty-icon">↗</div>
      <p class="eyebrow">YOUR JOURNEY SO FAR</p>
      <h1>Progress</h1>
      <p>Your fitness trends and progress history will appear here.</p>
      <a class="primary-button" routerLink="/home/dashboard">
        Back to dashboard <span>→</span>
      </a>
    </section>
  `
})
export class ProgressComponent {
}
