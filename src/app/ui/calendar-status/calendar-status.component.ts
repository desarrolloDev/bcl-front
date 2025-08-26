import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-calendar-status',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './calendar-status.component.html',
  styleUrl: './calendar-status.component.scss'
})
export class CalendarStatusComponent {
  @Input() hours: string[] = [];
  @Input() selectedSlots: { checked: boolean; text: string }[][] = [];
  @Input() tipo: string = 'pc';
  @Input() widthHora: string = '145px';
  @Input() fontSize: string = '14px';

  constructor(public listService: ListService) {}

  obtenerChecked(hora: number, semana: number): boolean {
    const slot = this.selectedSlots[hora][semana];
    if (slot) return slot.checked ?? false;
    else return false;
  }

  obtenerText(hora: number, semana: number): string {
    const slot = this.selectedSlots[hora][semana];
    if (slot) return slot.text ?? '';
    else return '';
  }
}
