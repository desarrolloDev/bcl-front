import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { InputComponent } from '../../ui/input/input.component';
import { CalendarInputComponent } from '../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { CalendarioHorariosComponent } from './calendario-horarios/calendario-horarios.component';

@Component({
  selector: 'app-clases-dictar',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    CalendarioHorariosComponent,
    MatStepperModule
],
  templateUrl: './clases-dictar.component.html',
  styleUrl: './clases-dictar.component.scss'
})
export class ClasesDictarComponent {
  private _fb = inject(NonNullableFormBuilder);

  isSmallScreen: boolean = false;
  
  maxDate = new Date(); // Fecha máxima para los calendarios (hoy)

  currentPage = 1;
  totalItems = 42;
  pageSize = 10;

  pageView: number = 1;

  public form = this._fb.group({
    fecha_inicio: this._fb.control<Date | null>(null, [Validators.required]),
    fecha_fin: this._fb.control<Date | null>(null, [Validators.required]),
    profesor: this._fb.control<string>('', [Validators.required]),
    status: this._fb.control<string>('', [Validators.required]),
  });

  listStatus = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Confirmado', label: 'Confirmado' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  usuarios = [
    { fecha: '15/07/2025', hora: '10:00', tipo: 'Individual', alumno: 'Ariana Gonzales', paquete: '4 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Pendiente', estatusCompleto: 'No disponible' },
    { fecha: '15/06/2025', hora: '10:00', tipo: 'Individual', alumno: 'Ariana Gonzales', paquete: '20 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Confirmado', estatusCompleto: '15 de 20' },
    { fecha: '15/05/2025', hora: '10:00', tipo: 'Individual', alumno: 'Ariana Gonzales', paquete: '4 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Cancelado', estatusCompleto: 'No disponible' },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  buscar() {
    if (this.form.valid) {
      const profesor = this.form.value.profesor;
      console.log('Buscar clases para el profesor:', profesor);
    } else {
      console.error('Formulario inválido');
    }
  }

  onPageChange(event: number) {
    console.log('Página nueva:', event);
  }

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }

  home() {
    this.router.navigate(['/dashboard'])
  }
}
