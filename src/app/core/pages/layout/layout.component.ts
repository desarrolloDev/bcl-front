import { Component, OnInit, ViewEncapsulation, inject, computed } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../layout/ui/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { SidenavService } from '../../services/sidenav.service';

const MOBILE_BREAKPOINT = '(min-width: 769px)';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    RouterModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  host: {
    class: 'app-layout',
    '[class.app-layout--collapsed]': 'sidenavService.state() === "collapsed"',
    '[class.app-layout--hidden]': 'sidenavService.state() === "hidden"',
    '[class.app-layout--visible]': 'sidenavService.state() === "visible"',
  },
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent {
  sidenavService = inject(SidenavService);

  private _breakpointObserver = inject(BreakpointObserver);

  sidenavWidth = computed(() => {
    const state = this.sidenavService.state();
    if (state === 'collapsed') return '65px'
    else if (state === 'visible') return '250px'
    return '0px'
  });

  constructor() {
    this._breakpointObserver
      .observe([MOBILE_BREAKPOINT])
      .pipe(takeUntilDestroyed())
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.sidenavService.state.set('visible');
        } else {
          this.sidenavService.state.set('hidden');
        }
      });
  }
}
