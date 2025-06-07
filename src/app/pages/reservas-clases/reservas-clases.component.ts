import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { ReservasComponent } from './reservas/reservas.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';

@Component({
  selector: 'app-reservas-clases',
  standalone: true,
  imports: [
    CommonModule,
    TerminosCondicionesComponent,
    ReservasComponent,
    ConfirmacionComponent
  ],
  templateUrl: './reservas-clases.component.html',
  styleUrl: './reservas-clases.component.scss'
})
export class ReservasClasesComponent {
  pageView: number = 2;

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }
}
