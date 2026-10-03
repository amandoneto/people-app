import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'people-app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isDark = signal(false);

  constructor() {
    if (!this.isBrowser) return;

    const savedTheme = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
    this.applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }

  toggle(): void {
    const theme: Theme = this.isDark() ? 'light' : 'dark';
    this.applyTheme(theme);

    if (this.isBrowser) {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: Theme): void {
    this.isDark.set(theme === 'dark');
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    this.document.documentElement.style.colorScheme = theme;
  }
}
