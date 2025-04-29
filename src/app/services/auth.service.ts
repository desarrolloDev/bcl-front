import { Injectable } from '@angular/core';
import { 
  Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User,
  createUserWithEmailAndPassword
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
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        this.router.navigate(['/dashboard'])
      })
      .catch(error => console.error(error));
  }

  // Cerrar sesión
  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/']));
  }

  // Usuario Logueado
  get currentUser() {
    return this.auth.currentUser;
  }
}
