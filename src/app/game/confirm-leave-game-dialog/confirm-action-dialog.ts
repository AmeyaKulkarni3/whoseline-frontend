import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmActionDialogData {
  title: string;
  message: string;
  warning?: string;
  confirmText: string;
}

@Component({
  selector: 'app-confirm-leave-game-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-action-dialog.html',
})
export class ConfirmActionDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmActionDialog>);
  readonly data = inject<ConfirmActionDialogData>(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
