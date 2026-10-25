import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '../app-header/app-header';
import { UserService } from '../../shared/user-service';

@Component({
  selector: 'app-app-shell',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly userService = inject(UserService);

  constructor() {
    this.userService.loadCurrentUser();
  }
}
