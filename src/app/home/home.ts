import { Component, computed, inject, signal } from '@angular/core';
import { GameResponse, Game, ActiveGameResponse, PastGameResponse } from '../game/game';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { JoinGameDialog } from './join-game-dialog/join-game-dialog';
import { UserService } from '../shared/user-service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule],
  templateUrl: './home.html',
})
export class Home {
  private readonly gameService = inject(Game);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);

  readonly loadingActiveGame = signal(true);
  readonly activeGame = signal<ActiveGameResponse | null>(null);
  readonly creatingGame = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pastGames = signal<PastGameResponse[]>([]);
  readonly loadingPastGames = signal(true);
  readonly pastGamesError = signal<string | null>(null);

  readonly currentUser = this.userService.user;

  readonly firstName = computed(() => {
    const name = this.currentUser()?.displayName?.trim();
    if (!name) return '';

    const firstPart = name.split(/\s+/)[0];

    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
  });

  constructor() {
    this.loadActiveGame();
    this.loadPastGames();
  }

  private loadActiveGame(): void {
    this.gameService.getMyActiveGame().subscribe({
      next: (game) => {
        this.activeGame.set(game);
        this.loadingActiveGame.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Unable to load active game');

        this.loadingActiveGame.set(false);
      },
    });
  }

  createGame(): void {
    if (this.activeGame()) {
      return;
    }
    this.creatingGame.set(true);
    this.errorMessage.set(null);
    this.gameService.createGame().subscribe({
      next: (resp) => {
        this.creatingGame.set(false);
        this.router.navigate(['/game', resp.code]);
      },
      error: (error) => {
        this.errorMessage.set('Unable to create Game');
        this.creatingGame.set(false);
      },
    });
  }

  openActiveGame(): void {
    const game = this.activeGame();
    if (!game) {
      return;
    }
    this.router.navigate(['/game', game.code]);
  }

  openJoinGame(): void {
    const dialogRef = this.dialog.open(JoinGameDialog, {
      width: '400px',
      maxWidth: 'calc(100vw - 32px)',
    });
    dialogRef.afterClosed().subscribe((code: string | undefined) => {
      if (code) {
        this.router.navigate(['/game', code]);
      }
    });
  }

  loadPastGames(): void {
    this.gameService.getPastGames().subscribe({
      next: (games) => {
        this.pastGames.set(games);
        this.loadingPastGames.set(false);
      },
      error: (error) => {
        this.pastGamesError.set(error.error?.message ?? 'Unable to load past games.');
        this.loadingPastGames.set(false);
      },
    });
  }

  openPastGame(game: PastGameResponse): void {
    this.router.navigate(['/game', game.code]);
  }

  formatGameDate(date: string | null): string {
    if (!date) {
      return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }
}
