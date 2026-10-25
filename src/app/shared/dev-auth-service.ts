import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface DevLoginResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class DevAuthService {
  private readonly http = inject(HttpClient);

  private readonly devUserIdKey = 'whoseline_dev_user_id';
  private readonly devUserTokenKey = 'whoseline_dev_user_token';

  readonly isDevMode = signal(false);

  async initialize(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const devUserId = params.get('devUser');

    if (!devUserId) {
      return;
    }

    const existingToken = sessionStorage.getItem(this.devUserTokenKey);

    if (existingToken) {
      this.isDevMode.set(true);
      return;
    }

    const userId = Number(devUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
      console.error('Invalid devUser parameter');
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<DevLoginResponse>('http://localhost:8080/dev/auth/login', { userId }),
      );

      sessionStorage.setItem(this.devUserTokenKey, response.accessToken);
      sessionStorage.setItem(this.devUserIdKey, userId.toString());

      this.isDevMode.set(true);
    } catch (error) {
      console.error('Dev authentication failed', error);
    }
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.devUserTokenKey);
  }

  getUserId(): number | null {
    const value = sessionStorage.getItem(this.devUserIdKey);
    if (!value) {
      return null;
    }
    const userId = Number(value);
    return Number.isInteger(userId) ? userId : null;
  }

  isDevAuthenticated(): boolean {
    return this.isDevMode() && !!this.getAccessToken();
  }

  logout(): void {
    sessionStorage.removeItem(this.devUserIdKey);
    sessionStorage.removeItem(this.devUserTokenKey);

    this.isDevMode.set(false);
  }
}
