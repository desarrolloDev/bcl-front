
import { Component, OnInit, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from "@angular/material/toolbar";
import { ButtonComponent } from '../../../../../ui/button/button.component';
import { SidenavService } from '../../../../../services/sidenav.service';

const MOBILE_BREAKPOINT = '(min-width: 769px)';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    ButtonComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  avatarName: string = '';
  name: string = '';

  private _breakpointObserver = inject(BreakpointObserver);
  private sidenavService = inject(SidenavService);
  isMobile = false;

  constructor() {
    this._breakpointObserver
      .observe([MOBILE_BREAKPOINT])
      .pipe(takeUntilDestroyed())
      .subscribe((state: BreakpointState) => {
        this.isMobile = !state.matches;
        this.updateSidenavState();
      });
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
