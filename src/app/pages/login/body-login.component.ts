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

  async onLogin() {
    this.loading = true;
    this.mensajeError = '';

    const result = await this.authService.login(this.email, this.password);
    console.log('result', result);

    if (result === undefined) {
      this.loading = false;
      this.mensajeError = 'Credenciales incorrectas';
    } else {
      localStorage.setItem('correo', this.email);
      this.dialogRef.close(true);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    }
  }

  onCreateUser() {
    this.dialogRef.close(true);
    this.router.navigate(['/createUser']);
  }

  async onForgotPassword() {
    // Validar que hay un email ingresado
    if (!this.email || this.email.trim() === '') {
      this.mensajeError = 'Por favor, ingresa tu correo electrónico antes de solicitar la recuperación';
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.mensajeError = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.loading = true;
    this.mensajeError = '';

    try {
      const result = await this.authService.resetPassword(this.email);
      
      if (result.success) {
        // Mostrar mensaje de éxito y cerrar el modal
        alert(result.message);
        this.dialogRef.close(false);
      } else {
        this.mensajeError = result.message;
      }
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      this.mensajeError = 'Error inesperado. Intenta nuevamente más tarde';
    } finally {
      this.loading = false;
    }
  }
}
