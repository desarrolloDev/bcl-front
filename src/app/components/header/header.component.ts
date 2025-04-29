import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { DialogService } from '../../pages/login/dialog.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  nombre$ = this.authService.nombre$;

  readonly dialog = inject(MatDialog);

  constructor(
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
  }

  iniciarSesion() {
    this.dialogService.openLoadingDialog();
  }

  logout() {
    this.authService.logout();
    this.authService.clearNombre();
    localStorage.clear();
  }
}
