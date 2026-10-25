import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Callback } from './auth/callback/callback';
import { Home } from './home/home';
import { authGuard } from './auth/auth-guard';
import { GameHome } from './game/game-home/game-home';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  // {
  //     path:'',
  //     redirectTo:'login',
  //     pathMatch: 'full'
  // },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'login/oauth2/code/whoseline',
    component: Callback,
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'game/:code',
        component: GameHome,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
