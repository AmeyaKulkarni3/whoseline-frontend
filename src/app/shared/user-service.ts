import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { pipe, tap } from 'rxjs';

export interface UserProfile {
  id: number;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<UserProfile | null>(null);

  readonly user = this.currentUser.asReadonly();

  loadCurrentUser(): void {
    if (this.currentUser()) {
      return;
    }

    this.http.get<UserProfile>('http://localhost:8083/api/users/me').subscribe({
      next: (user) => this.currentUser.set(user),
    });
  }
}
