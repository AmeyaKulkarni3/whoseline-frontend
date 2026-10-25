import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface StoryNameDialogData {
  storyName: string;
  isStarting: boolean;
}

@Component({
  selector: 'app-story-name-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './story-name-dialog.html',
})
export class StoryNameDialog {
  readonly data = inject<StoryNameDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(MatDialogRef<StoryNameDialog, string | undefined>);

  storyName = this.data.storyName ?? '';
  validationError = '';

  save(): void {
    const title = this.storyName.trim();
    if (!title) {
      this.validationError = 'Please enter a story name.';
      return;
    }
    if (title.length > 100) {
      this.validationError = 'Story name cannot exceed 100 characters.';
      return;
    }
    this.dialogRef.close(title);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
