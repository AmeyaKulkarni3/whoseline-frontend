import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, of, switchMap, timer, catchError } from 'rxjs';
import { Game, GamePlayResponse, GameResponse } from '../game';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../shared/user-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionDialog } from '../confirm-leave-game-dialog/confirm-action-dialog';
import { MatButtonModule } from '@angular/material/button';
import { StoryNameDialog } from '../story-name-dialog/story-name-dialog';

@Component({
  selector: 'app-game-home',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './game-home.html',
})
export class GameHome {
  private readonly gameService = inject(Game);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly game = signal<GameResponse | null>(null);
  readonly gamePlay = signal<GamePlayResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly gameplayError = signal<string | null>(null);
  readonly copied = signal(false);

  readonly sentenceText = signal('');
  readonly submittingSentence = signal(false);
  readonly sentenceError = signal<string | null>(null);

  readonly leaving = signal(false);
  readonly leaveError = signal<string | null>(null);

  readonly ending = signal(false);
  readonly endError = signal<string | null>(null);

  readonly starting = signal(false);
  readonly startError = signal<string | null>(null);

  readonly currentUser = this.userService.user;

  constructor() {
    const code = this.route.snapshot.paramMap.get('code');

    if (!code) {
      this.error.set('Invalid Game');
      this.loading.set(false);
      return;
    }

    this.loadGame(code);
  }

  private loadGame(code: string): void {
    this.gameService.getGame(code).subscribe({
      next: (game) => {
        this.game.set(game);
        this.loading.set(false);

        if (game.status === 'IN_PROGRESS') {
          this.loadGamePlay(code);
        } else {
          this.gamePlay.set(null);
        }

        this.startPolling(code);
      },
      error: () => {
        this.error.set('Game Not Found');
        this.loading.set(false);
      },
    });
  }

  private loadGamePlay(code: string): void {
    this.gameService.getGamePlay(code).subscribe({
      next: (gamePlay) => {
        this.gamePlay.set(gamePlay);
        this.gameplayError.set(null);
      },
      error: (error) => {
        this.gameplayError.set(error.error?.message ?? 'Unable to load gameplay.');
      },
    });
  }

  private startPolling(code: string): void {
    timer(3000, 3000)
      .pipe(
        switchMap(() =>
          this.gameService.getGame(code).pipe(
            switchMap((game) => {
              const previousStatus = this.game()?.status;

              this.game.set(game);
              if (previousStatus === 'IN_PROGRESS' && game.status === 'COMPLETED') {
                window.alert('The game has ended. Here is the story you created together.');
                window.alert('The game has ended. Here is the story you created together.');
                this.router.navigate(['/']);
              }

              if (game.status === 'COMPLETED' || game.status === 'IN_PROGRESS') {
                return this.gameService.getGamePlay(code);
              }

              this.gamePlay.set(null);
              return of(null);
            }),
            catchError(() => EMPTY),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((gamePlay) => {
        if (gamePlay) {
          this.gamePlay.set(gamePlay);
          this.gameplayError.set(null);
        }
      });
  }

  currentTurnPlayer() {
    const play = this.gamePlay();

    return play?.players.find((player) => player.userId === play.currentTurnUserId);
  }

  isMyTurn(): boolean {
    const userId = this.currentUser()?.id;
    const currentTurnUserId = this.gamePlay()?.currentTurnUserId;

    return userId != null && currentTurnUserId != null && userId === currentTurnUserId;
  }

  currentRoundSentenceCount(): number {
    const play = this.gamePlay();

    if (!play || play.currentRound == null) {
      return 0;
    }

    return play.sentences.filter((sentence) => sentence.roundNumber === play.currentRound).length;
  }

  submitSentence(): void {
    const code = this.game()?.code;
    const text = this.sentenceText().trim();
    const maxLength = this.gamePlay()?.maxSentenceLength ?? 250;

    if (
      !code ||
      !text ||
      text.length > maxLength ||
      !this.isMyTurn() ||
      this.submittingSentence()
    ) {
      return;
    }

    this.submittingSentence.set(true);
    this.sentenceError.set(null);

    this.gameService.submitSentence(code, text).subscribe({
      next: () => {
        this.sentenceText.set('');
        this.submittingSentence.set(false);
        this.loadGamePlay(code);
      },
      error: (error) => {
        this.submittingSentence.set(false);
        this.sentenceError.set(error.error?.message ?? 'Unable to submit your sentence.');
        this.loadGamePlay(code);
      },
    });
  }

  async copyGameCode(): Promise<void> {
    const code = this.game()?.code;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.copied.set(false);
    }
  }

  leaveGame(): void {
    const code = this.game()?.code;

    if (!code || this.leaving()) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmActionDialog, {
      width: '360px',
      data: {
        title: 'Leave Game?',
        message: 'Are you sure you want to leave this game?',
        warning: "You won't be able to rejoin this game later.",
        confirmText: 'Leave Game',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performLeaveGame(code);
      }
    });
  }

  private performLeaveGame(code: string): void {
    this.leaving.set(true);
    this.leaveError.set(null);

    this.gameService.leaveGame(code).subscribe({
      next: () => {
        window.location.href = '/';
      },
      error: (error) => {
        this.leaving.set(false);
        this.leaveError.set(error.error?.message ?? 'Unable to leave game.');
      },
    });
  }

  endGame(): void {
    const currentGame = this.game();

    if (!currentGame || this.ending()) {
      return;
    }

    const code = currentGame.code;
    const isWaiting = currentGame.status === 'WAITING';

    const dialogRef = this.dialog.open(ConfirmActionDialog, {
      width: '360px',
      data: {
        title: 'End Game?',
        message: isWaiting
          ? 'This game has not started yet.'
          : 'Are you sure you want to end this game?',
        warning: isWaiting
          ? 'The game will be cancelled.'
          : 'The game will be marked as completed.',
        confirmText: 'End Game',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performEndGame(code);
      }
    });
  }

  private performEndGame(code: string): void {
    this.ending.set(true);
    this.endError.set(null);

    this.gameService.endGame(code).subscribe({
      next: () => {
        this.ending.set(false);

        this.game.update((game) => (game ? { ...game, status: 'COMPLETED' } : game));

        this.loadGamePlay(code);

        this.router.navigate(['/']);
      },
      error: (error) => {
        this.ending.set(false);
        this.endError.set(error.error?.message ?? 'Unable to end game.');
      },
    });
  }

  startGame(): void {
    const code = this.game()?.code;

    if (!code || this.starting()) {
      return;
    }

    const dialogRef = this.dialog.open(StoryNameDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        storyName: '',
        isStarting: true,
      },
    });

    dialogRef.afterClosed().subscribe((storyName: string | undefined) => {
      if (storyName) {
        this.saveStoryNameAndStart(code, storyName);
      }
    });
  }

  private saveStoryNameAndStart(code: string, storyName: string): void {
    this.starting.set(true);
    this.startError.set(null);

    this.gameService
      .updateStoryName(code, storyName)
      .pipe(switchMap(() => this.gameService.startGame(code)))
      .subscribe({
        next: () => {
          this.starting.set(false);

          this.game.update((game) => (game ? { ...game, storyName, status: 'IN_PROGRESS' } : game));

          this.loadGamePlay(code);
        },
        error: (error) => {
          this.starting.set(false);
          this.startError.set(
            error.error?.message ?? 'Unable to save the story name or start the game.',
          );
        },
      });
  }

  storyRoundNumbers(): number[] {
    const play = this.gamePlay();

    if (!play) {
      return [];
    }

    const lastRound = play.currentRound ?? play.totalRounds;

    return Array.from({ length: lastRound }, (_, index) => index + 1);
  }

  storyParagraphs(): { roundNumber: number; text: string }[] {
    const sentences = this.gamePlay()?.sentences ?? [];
    const grouped = new Map<number, string[]>();

    for (const sentence of sentences) {
      const lines = grouped.get(sentence.roundNumber) ?? [];
      lines.push(sentence.text);
      grouped.set(sentence.roundNumber, lines);
    }

    return Array.from(grouped.entries())
      .sort(([roundA], [roundB]) => roundA - roundB)
      .map(([roundNumber, lines]) => ({
        roundNumber,
        text: lines.join(' '),
      }));
  }

  renameStory(): void {
    const currentGame = this.game();

    if (
      !currentGame ||
      currentGame.ownerUserId !== this.currentUser()?.id ||
      !['WAITING', 'IN_PROGRESS'].includes(currentGame.status)
    ) {
      return;
    }

    const dialogRef = this.dialog.open(StoryNameDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        storyName: currentGame.storyName ?? '',
        isStarting: false,
      },
    });

    dialogRef.afterClosed().subscribe((storyName: string | undefined) => {
      if (!storyName || storyName === currentGame.storyName) {
        return;
      }

      this.saveStoryName(currentGame.code, storyName);
    });
  }

  private saveStoryName(code: string, storyName: string): void {
    this.gameService.updateStoryName(code, storyName).subscribe({
      next: () => {
        this.game.update((game) => (game ? { ...game, storyName } : game));
      },
      error: (error) => {
        this.gameplayError.set(error.error?.message ?? 'Unable to update the story name.');
      },
    });
  }
}
