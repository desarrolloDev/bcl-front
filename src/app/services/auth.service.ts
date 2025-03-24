import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(error => console.error(error));
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/']));
  }

  getUser(): Observable<User | null> {
    return of(this.currentUser);
  }
}
