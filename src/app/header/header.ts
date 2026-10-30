import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isDark = this.themeService.isDark;
  protected readonly isAuthenticated = this.authService.token;

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  protected signOut(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
