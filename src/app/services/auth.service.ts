import { Injectable } from '@angular/core';
import { 
  Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User,
  createUserWithEmailAndPassword, sendPasswordResetEmail
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userData = new BehaviorSubject<User | null>(null);
  user$ = this.userData.asObservable();

  private nombreSubject = new BehaviorSubject<string | null>(localStorage.getItem('nombre'));
  nombre$ = this.nombreSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.userData.next(user);
    });
  }

  setNombre(nombre: string) {
    this.nombreSubject.next(nombre);
  }

  clearNombre() {
    this.nombreSubject.next(null);
  }

  // Crear sesión Usuario
  registrarUsuario(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Iniciar Sesión
  async login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  // Cerrar sesión
  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/']));
  }

  // Usuario Logueado
  get currentUser() {
    return this.auth.currentUser;
  }

  // Recuperar contraseña
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email, {
        url: window.location.origin + '/login', // URL de redirección después del reset
        handleCodeInApp: false
      });
      
      return {
        success: true,
        message: 'Se ha enviado un correo de recuperación a tu email. Revisa tu bandeja de entrada y spam.'
      };
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de recuperación';
      
      // Manejar diferentes tipos de errores de Firebase
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico ingresado no es válido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiadas solicitudes. Intenta nuevamente más tarde';
          break;
        default:
          errorMessage = 'Error inesperado. Intenta nuevamente más tarde';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Verificar si un email existe en el sistema
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Intentar enviar un email de reset para verificar si el usuario existe
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      // Para otros errores, asumimos que el usuario podría existir
      return true;
    }
  }

  
}