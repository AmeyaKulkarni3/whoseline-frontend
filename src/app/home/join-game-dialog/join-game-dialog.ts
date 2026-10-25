import { Component, inject, signal } from '@angular/core';
import { Game } from '../../game/game';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-join-game-dialog',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './join-game-dialog.html',
})
export class JoinGameDialog {
  private readonly gameService = inject(Game);
  private readonly dialogRef = inject(MatDialogRef<JoinGameDialog>);

  readonly code = signal('');
  readonly joining = signal(false);
  readonly errorMessage = signal<string | null>(null);

  joinGame() {
    const code = this.code().trim().toUpperCase();

    if (code.length !== 6) {
      this.errorMessage.set('Enter a valid 6-character game code.');
      return;
    }

    this.joining.set(true);
    this.errorMessage.set(null);

    this.gameService.joinGame(code).subscribe({
      next: () => {
        this.dialogRef.close(code);
      },
      error: (error) => {
        this.joining.set(false);

        const errorCode = error.error?.code;

        switch (errorCode) {
          case 'GAME_FULL':
            this.errorMessage.set(error.error.message);
            break;

          case 'ALREADY_JOINED':
            this.errorMessage.set('You have already joined this game.');
            break;

          case 'ACTIVE_GAME_ALREADY_EXISTS':
            this.errorMessage.set('You already have an active game.');
            break;

          case 'GAME_NOT_JOINABLE':
            this.errorMessage.set('This game has already started and cannot be joined.');
            break;

          case 'GAME_NOT_FOUND':
            this.errorMessage.set('Game not found. Check the game code.');
            break;

          default:
            this.errorMessage.set(error.error?.message ?? 'Unable to join game.');
        }
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
