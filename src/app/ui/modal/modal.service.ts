import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from './confirm/confirm.component';
import { LoadingComponent } from './loading/loading.component';
import { ResultComponent } from './result/result.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private dialog = inject(MatDialog);

    openConfirmDialog(data: any) {
        return this.dialog.open(ConfirmComponent, {
            data: data,
            width: '400px'
        }).afterClosed();
    }

    openLoadingDialog(message: string) {
        return this.dialog.open(LoadingComponent, {
            data: { message },
            disableClose: true
        });
    }

    openResultDialog(success: boolean, message: string) {
        return this.dialog.open(ResultComponent, {
            data: { success, message },
            width: '400px'
        });
    }
}