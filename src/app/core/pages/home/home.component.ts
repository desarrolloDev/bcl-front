import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SidenavComponent } from './ui/sidenav/sidenav.component';
import { NavbarComponent } from './ui/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { SidenavService } from '@/app/core/services/sidenav.service';
import { MenuItem } from '@/app/core/interfaces/menu.interface';

const MOBILE_BREAKPOINT = '(min-width: 769px)';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    SidenavComponent,
    NavbarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  host: {
    class: 'app-layout',
    '[class.app-layout--collapsed]': 'sidenavService.state() === "collapsed"',
    '[class.app-layout--hidden]': 'sidenavService.state() === "hidden"',
    '[class.app-layout--visible]': 'sidenavService.state() === "visible"',
  },
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  authService = inject(AuthService);
  sidenavService = inject(SidenavService);

  private _breakpointObserver = inject(BreakpointObserver);

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

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    if (user) {
      const modulos = user.Modulos;
      const submodulos = user.Submodulos;
      const menus: MenuItem[] = modulos.map((modulo: any) => ({
        order: modulo.nro_orden,
        route: modulo.ruta,
        icon: modulo.imagen,
        title: modulo.descripcion,
        submodulos: submodulos
                      .filter((submodulo: any) => submodulo.cod_modulo === modulo.cod_modulo)
                      .map((submodulo: any) => ({
                        order: submodulo.nro_orden,
                        route: submodulo.ruta,
                        icon: submodulo.imagen,
                        title: submodulo.descripcion
                      }))
      }));
      menus.push({
        order: menus.length + 1,
        route: 'descargas',
        icon: 'download',
        title: 'Descargas',
        submodulos: []
      })
      this.sidenavService.menuItems.set(menus.sort((a, b) => a.order - b.order));
    }
  }
}
