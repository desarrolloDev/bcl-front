import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { IdleService } from './services/idle.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'bcl-front';
  private idleService = inject(IdleService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.idleService.startWatching();
    this.idleService.onIdle$.subscribe(() => {
      this.authService.logout();
      this.authService.clearNombre();
      localStorage.clear();
    });
  }
}
