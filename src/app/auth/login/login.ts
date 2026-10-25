import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../auth';
import { DevAuthService } from '../../shared/dev-auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(Auth);
  private readonly devAuthService = inject(DevAuthService);
  private readonly router = inject(Router);

  constructor() {
    if (this.devAuthService.getAccessToken()) {
      this.router.navigateByUrl('/');
    }
  }

  loginWithGoogle(): void {
    this.authService.login();
  }
}
