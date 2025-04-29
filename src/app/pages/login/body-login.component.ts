import { Component, Input, inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputComponent } from '../../ui/input/input.component';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

@Component({
  selector: 'app-body-login',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    MatDialogContent,
    MatDialogActions
  ],
  templateUrl: './body-login.component.html'
})
export class BodyLoginComponent {
  readonly dialogRef = inject(MatDialogRef<LoginComponent>);

  @Input() vista: string = '';

  loading: boolean = false;

  email: string = '';
  password: string = '';
  mensajeError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin() {
    this.loading = true;
    this.mensajeError = '';

    this.authService.login(this.email, this.password)
      .then(() => {
        localStorage.setItem('correo', this.email);
        this.dialogRef.close(true);
        this.loading = false;
      })
      .catch((error) => {
        console.error(error);
        this.loading = false;
        this.mensajeError = 'Credenciales incorrectas';
      });
  }

  onCreateUser() {
    this.dialogRef.close(true);
    this.router.navigate(['/createUser']);
  }
}
