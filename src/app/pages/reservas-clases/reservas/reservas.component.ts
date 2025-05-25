import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../../../ui/select/select.component';
import { InputComponent } from '../../../ui/input/input.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    InputComponent
  ],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent {
  curso: string = '';
  colegio: string = '';
  gradoCiclo: string = '';
  tema: string = '';
  tipoClase: string = '';
  recompensa: string = '';
  paqueteClase: string = '';
  profesor: string = '';
  
  listCurso: any = [];
  listGradoCiclo: any = [];
  listTipoClase: any = [];
  listRecompensa: any = [];
  listPaqueteClase: any = [];
  listProfesor: any = [];
}
