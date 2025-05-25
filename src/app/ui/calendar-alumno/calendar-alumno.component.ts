import { Component, Input } from '@angular/core';
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
  @Input() hours: string[] = [];
  @Input() selectedSlots: boolean[][] = [];
  @Input() tipo: string = 'pc';
  @Input() widthHora: string = '145px';
  @Input() fontSize: string = '14px';

  SlotStatus = 'disponible' | 'reservado' | 'seleccionado' | 'bloqueado';

  constructor(public listService: ListService) {}

  toggleSlot(row: number, col: number) {
    this.selectedSlots[row][col] = !this.selectedSlots[row][col];
  }
}
