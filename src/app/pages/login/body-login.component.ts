import { Component, Input, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

@Component({
  selector: 'app-body-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
  ],
  templateUrl: './body-login.component.html'
})
export class BodyLoginComponent {
  readonly dialogRef = inject(MatDialogRef<LoginComponent>);

  @Input() vista: string = '';
  
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).then(() => {
      this.dialogRef.close(true);
    })
    .catch(err => {
      console.error('Error al registrar:', err);
    });
  }

  onCreateUser() {
    this.dialogRef.close(true);
    this.router.navigate(['/createUser']);
  }
}
