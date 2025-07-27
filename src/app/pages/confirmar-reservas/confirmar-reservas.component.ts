import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../ui/input/input.component';
import { CalendarInputComponent } from '../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { GestionHorariosComponent } from './gestion-horarios/gestion-horarios.component';

@Component({
  selector: 'app-confirmar-reservas',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    GestionHorariosComponent
  ],
  templateUrl: './confirmar-reservas.component.html',
  styleUrl: './confirmar-reservas.component.scss'
})
export class ConfirmarReservasComponent {
private _fb = inject(NonNullableFormBuilder);
  
  maxDate = new Date(); // Fecha máxima para los calendarios (hoy)

  currentPage = 1;
  totalItems = 42;
  pageSize = 10;

  pageView: number = 1;

  public form = this._fb.group({
    fecha_inicio: this._fb.control<Date | null>(null, [Validators.required]),
    fecha_fin: this._fb.control<Date | null>(null, [Validators.required]),
    profesor: this._fb.control<string>('', [Validators.required]),
    alumno: this._fb.control<string>('', [Validators.required]),
  });

  usuarios = [
    { fecha: '15/07/2025', hora: '10:00', tipo: 'Individual', alumno: 'Juan Pérez', profesor: 'Judith Portocarrero', paquete: '4 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Pendiente', estatusCompleto: 'No disponible' },
    { fecha: '15/06/2025', hora: '10:00', tipo: 'Individual', alumno: 'Juan Pérez', profesor: 'Judith Portocarrero', paquete: '20 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Confirmado', estatusCompleto: '15 de 20' },
    { fecha: '15/05/2025', hora: '10:00', tipo: 'Individual', alumno: 'Juan Pérez', profesor: 'Judith Portocarrero', paquete: '4 Clases', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Cancelado', estatusCompleto: 'No disponible' },
  ];

  constructor( ) {}

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

  actualizarReserva() {
    console.log('Actualizar reserva');
    this.cambiarVista(2);
  }

  cambiarVista(nroVista: any) {
    this.pageView = nroVista;
  }
}
