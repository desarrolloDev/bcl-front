import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth: Auth = inject(Auth);

  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        if (user) {
          observer.next(true);
        } else {
          this.router.navigate(['/login']);
          observer.next(false);
        }
        observer.complete();
      });
      return { unsubscribe };
    });
  }
}
