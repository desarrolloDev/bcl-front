import { AuthService } from '@/app/pages/auth/data-access/auth.service';
import { SidenavService } from '@/app/core/services/sidenav.service';
import { AvatarComponent } from '@/app/shared/ui/avatar/avatar.component';
import { ButtonComponent } from '@/app/shared/ui/button/button.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MenuButtonComponent } from '@/app/shared/ui/menu-button/menu-button.component';
import { Router } from '@angular/router';

const MOBILE_BREAKPOINT = '(min-width: 769px)';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    AvatarComponent,
    ButtonComponent,
    MenuButtonComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  avatarName: string = '';
  name: string = '';

  private _breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  sidenavService = inject(SidenavService);
  authService = inject(AuthService);
  isMobile = false;

  constructor() {
    this._breakpointObserver
      .observe([MOBILE_BREAKPOINT])
      .pipe(takeUntilDestroyed())
      .subscribe((state: BreakpointState) => {
        this.isMobile = !state.matches;
        this.updateSidenavState();
      });
    
    const user = this.authService.getUserInfo();
    this.name = user?.nombres;
    if (user && this.name) {
      const nombresArray = user?.nombres.split(' ');
      const iniciales = nombresArray[0][0] + nombresArray[nombresArray.length - 1][0];
      this.avatarName = iniciales;
    }
  }

  toggle() {
    this.sidenavService.state.update((val) => {
      if (this.isMobile) {
        return val === 'hidden' ? 'visible' : 'hidden';
      } else {
        return val === 'collapsed' ? 'visible' : 'collapsed';
      }
    });
  }

  private updateSidenavState() {
    // Aquí puedes inicializar el estado basado en el tamaño actual
    if (this.isMobile) {
      this.sidenavService.state.set('hidden');
    } else {
      this.sidenavService.state.set('collapsed');
    }
  }
}
