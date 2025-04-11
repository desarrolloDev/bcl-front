import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
    private dialog = inject(MatDialog);

    openLoadingDialog() {
        return this.dialog.open(LoginComponent);
    }
}
