import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SelectComponent } from '../../../ui/select/select.component';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarComponent } from '../../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { GetDataService } from '../../../services/getData.service';
import { ListService } from '../../../services/list.service';

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    InputComponent,
    CalendarComponent,
     CheckboxComponent,
  ],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.scss'
})
export class GestionHorariosComponent implements OnInit {
  isSmallScreen = false;

  horariosList: string[] = []; // horarios de clase
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana;
  semanasList: { id: string, nombre: string }[] = []; // intervalos de semanas
  
  semanaCalendar: string = ''; // semana seleccionada
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = [];
  selectedSemana: string = ''; // semana seleccionada
  selectedtDia: string = ''; // dia seleccionado
  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean, type: string }
      }
    }
  } = {};

  constructor(
    private getDataService: GetDataService,
    public listService: ListService
  ) { }

  async ngOnInit() {
    const semana = this.listService.intervaloSemana();
    this.semanasList = semana;

    const horarios = await this.getDataService.horariosList();
    this.horariosList = horarios;

    this.semanaBloqueado();
  }

  semanaBloqueado() {
    const newData: any = {};
    for (let hora of this.horariosList) {
      newData[hora] = {};
      for (let dia of this.semanasList) {
        newData[hora][dia.id] = 'bloqueado';
      }
    }
    this.selectedSlots = newData;
  }

  changeWeek(offset: number) {
    const newOffset = this.semanaOffset + offset;
    if (newOffset >= 0 && newOffset <= 3) {
      this.semanaOffset = newOffset;
      this.semanaCalendar = this.semanasList[newOffset].id;
      this.actualizarHorarios();
    }
  }

  actualizarHorarios(): void {
    const newData: any[] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        newData[j][i] = this.data[this.semanaCalendar][this.diasList[i].id][this.horariosList[j]].checked
      }
    }
    this.selectedSlots = newData;
  }

  confirmar() {

  }

  guardarHorarios() {

  }
}
