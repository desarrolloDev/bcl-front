import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-calendar-alumno',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './calendar-alumno.component.html',
  styleUrl: './calendar-alumno.component.scss'
})
export class CalendarAlumnoComponent {
  @Output() actualizarHorario = new EventEmitter<[string, string, string]>();

  @Input() horas: string[] = [];
  @Input() selectedSlots: any = {};
  @Input() tipo: string = 'pc';
  @Input() widthHora: string = '145px';
  @Input() fontSize: string = '14px';

  dias: any[] = this.listService.diasSemana;

  // 'disponible' | 'reservado' | 'seleccionado' | 'bloqueado'

  constructor(public listService: ListService) {}

  clicSlot(hora: string, dia: string) {
    const estado = this.selectedSlots[hora][dia];
    if (estado === 'disponible') {
      this.selectedSlots[hora][dia] = 'seleccionado';
      this.actualizarHorario.emit([dia, hora, 'seleccionado']);
    } else if (estado === 'seleccionado') {
      this.selectedSlots[hora][dia] = 'disponible';
      this.actualizarHorario.emit([dia, hora, 'disponible']);
    }
  }

  getClase(estado: string) {
    return {
      'disponible': estado === 'disponible',
      'reservado': estado === 'reservado',
      'seleccionado': estado === 'seleccionado',
      'bloqueado': estado === 'bloqueado',
    };
  }

  getTexto(estado: string): string {
    let status = '';
    if (estado == 'disponible') status = 'Disponible';
    if (estado == 'reservado') status = 'Reservado';
    if (estado == 'seleccionado') status = 'Seleccionado';
    if (estado == 'bloqueado') status = '';
    return status;
  }
}
