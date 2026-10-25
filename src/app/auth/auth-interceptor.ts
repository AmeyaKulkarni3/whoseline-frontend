import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap } from 'rxjs';
import { DevAuthService } from '../shared/dev-auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isGatewayApiRequest = req.url.startsWith('http://localhost:8080/api/');

  if (!isGatewayApiRequest) {
    return next(req);
  }

  const devAuthService = inject(DevAuthService);
  const devToken = devAuthService.getAccessToken();

  if (devToken) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${devToken}`,
        },
      }),
    );
  }

  const oidcSecurityService = inject(OidcSecurityService);

  return oidcSecurityService.getAccessToken().pipe(
    switchMap((accessToken) => {
      if (!accessToken) {
        return next(req);
      }

      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    }),
  );
};
