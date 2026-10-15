import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly themeStorageKey = 'fyntriva-theme';

  isDarkTheme = signal(
    this.isBrowser && localStorage.getItem(this.themeStorageKey) === 'dark'
  );

  constructor() { }

  setDarkTheme(isDark: boolean): void {

    this.isDarkTheme.set(isDark);

    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.themeStorageKey, isDark ? 'dark' : 'light');

    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {

    if (this.isBrowser) {
      document.documentElement.classList.toggle('dark-theme', isDark);
    }
  }
  
}
