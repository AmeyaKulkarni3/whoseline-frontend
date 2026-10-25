import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs';
import { DevAuthService } from '../shared/dev-auth-service';

export const authGuard: CanActivateFn = () => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);
  const devAuthService = inject(DevAuthService);

  if (devAuthService.getAccessToken()) {
    return true;
  }

  return oidcSecurityService.isAuthenticated$.pipe(
    map(({ isAuthenticated }) => (isAuthenticated ? true : router.parseUrl('/login'))),
  );
};
