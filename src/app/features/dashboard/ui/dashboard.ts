import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly user = inject(AuthService).user;
}
