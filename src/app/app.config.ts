import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authConfig } from './auth/auth.config';
import { provideAuth, withAppInitializerAuthCheck } from 'angular-auth-oidc-client';
import { authInterceptor } from './auth/auth-interceptor';
import { UserService } from './shared/user-service';
import { DevAuthService } from './shared/dev-auth-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(authConfig, withAppInitializerAuthCheck()),
    // provideAuth(authConfig),
    provideAppInitializer(() => {
      const devAuthSevice = inject(DevAuthService);
      return devAuthSevice.initialize();
    }),
  ],
};
