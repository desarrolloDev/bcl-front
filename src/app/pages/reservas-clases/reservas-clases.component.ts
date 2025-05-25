import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { ReservasComponent } from './reservas/reservas.component';

@Component({
  selector: 'app-reservas-clases',
  standalone: true,
  imports: [
    MatStepperModule,
    TerminosCondicionesComponent,
    ReservasComponent
  ],
  templateUrl: './reservas-clases.component.html',
  styleUrl: './reservas-clases.component.scss'
})
export class ReservasClasesComponent {
  isLinear: boolean = false;
}
