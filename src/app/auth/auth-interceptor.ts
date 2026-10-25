import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap } from 'rxjs';
import { DevAuthService } from '../shared/dev-auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // const isGameService = req.url.startsWith('http://localhost:8082');

  // const isAuthService = req.url.startsWith('http://localhost:8083');

  // if (!isGameService && !isAuthService) {
  //   return next(req);
  // }

  // const devAuthService = inject(DevAuthService);

  // const devToken = devAuthService.getAccessToken();

  // if (devToken) {
  //   return next(
  //     req.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${devToken}`,
  //       },
  //     }),
  //   );
  // }

  // const oidcSecurityService = inject(OidcSecurityService);

  // return oidcSecurityService.getAccessToken().pipe(
  //   switchMap((accessToken) => {
  //     if (!accessToken) {
  //       return next(req);
  //     }

  //     const authReq = req.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });

  //     return next(authReq);
  //   }),
  // );

  const isGatewayRequest = req.url.startsWith('http://localhost:8080/api/');
  const isAuthApiRequest = req.url.startsWith('http://localhost:8083/api/');

  if (!isGatewayRequest && !isAuthApiRequest) {
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

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next(authReq);
    }),
  );
};
