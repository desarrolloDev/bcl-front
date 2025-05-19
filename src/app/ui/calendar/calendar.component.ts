import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  @Input() hours: string[] = [];
  @Input() selectedSlots: boolean[][] = [];
  @Input() tipo: string = 'pc';
  @Input() widthHora: string = '145px';
  @Input() fontSize: string = '14px';

  constructor(public listService: ListService) {}

  // toggleSlot(row: number, col: number) {
  //   this.selectedSlots[row][col] = !this.selectedSlots[row][col];
  // }
}
