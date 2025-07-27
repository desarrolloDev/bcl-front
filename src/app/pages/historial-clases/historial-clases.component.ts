import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../ui/input/input.component';
import { CalendarInputComponent } from '../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { ModalService } from '../../ui/modal/modal.service';
import { ActualizarReservaComponent } from './actualizar-reserva/actualizar-reserva.component';

@Component({
  selector: 'app-historial-clases',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    ActualizarReservaComponent
  ],
  templateUrl: './historial-clases.component.html',
  styleUrl: './historial-clases.component.scss'
})
export class HistorialClasesComponent {
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
  });

  usuarios = [
    { fecha: '15/07/2025', hora: '10:00', tipo: 'Individual', paquete: '4 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Pendiente', estatusCompleto: 'No disponible' },
    { fecha: '15/06/2025', hora: '10:00', tipo: 'Individual', paquete: '20 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Confirmado', estatusCompleto: '15 de 20' },
    { fecha: '15/05/2025', hora: '10:00', tipo: 'Individual', paquete: '4 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Cancelado', estatusCompleto: 'No disponible' },
  ];

  constructor(
    private modalService: ModalService
  ) {}

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

  async actualizarReserva() {
    console.log('Actualizar reserva');
    
    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¡Recuerda que este módulo solo es para completar tus reservas, no podrás reprogramar ninguna clase!',
      mensaje: 'En caso desees reprogramar una clase contactate con nuestra Coordinadora Académica',
      type: '',
      msgBtnAceptar: 'Continuar',
      msgBtCerrar: 'Volver al menú'
    }).toPromise();

    if (confirmed) {
      this.cambiarVista(2);
    }
  }

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }
}
