import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'http://localhost:8083',
    redirectUrl: 'http://localhost:4200/login/oauth2/code/whoseline',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    clientId: 'whoseline-angular',
    scope: 'openid profile email', // 'openid profile ' + your scopes
    responseType: 'code',
    silentRenew: false,
    renewTimeBeforeTokenExpiresInSeconds: 10,
  },
};
