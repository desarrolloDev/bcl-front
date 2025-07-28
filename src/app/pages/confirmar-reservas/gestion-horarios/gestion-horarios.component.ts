import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectComponent } from '../../../ui/select/select.component';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarComponent } from '../../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { GetDataService } from '../../../services/getData.service';
import { ListService } from '../../../services/list.service';
import { DataService } from '../../../services/data.service';
import { FirestoreService } from '../../../services/firestore.service';

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
    MatStepperModule
  ],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.scss'
})
export class GestionHorariosComponent implements OnInit {
  isSmallScreen = false;
  isLinear = false;

  checked = false;

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
        [time: string]: { checked: boolean }
      }
    }
  } = {};

  constructor(
    private getDataService: GetDataService,
    public listService: ListService,
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private fs: FirestoreService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    const semana = this.listService.intervaloSemana();
    this.semanasList = semana;

    // const horarios = await this.getDataService.horariosList();
    // this.horariosList = horarios;

    // this.semanaBloqueado();
    this.dataHorarios();
  }

  dataHorarios() {
    if (this.dataService.datosHorarios.length == 0) {
      this.fs.getSubColeccionData('data_profesor/horarios')
        .then(data => {
          this.dataService.setDatosHorarios(data.data);
          this.horariosList = data.data;

          const newSlots: any[] = [];
          for (let i = 0; i > data.data; i++) {
            newSlots.push([false, false, false, false, false, false, false]);
          }
          this.selectedSlots = newSlots;
        })
        .catch((error) => {
          console.log('error', error);
        });
    } else {
      this.horariosList = this.dataService.datosHorarios;

      const newSlots: any[] = [];
      for (let i = 0; i > this.dataService.datosHorarios; i++) {
        newSlots.push([false, false, false, false, false, false, false]);
      }
      this.selectedSlots = newSlots;
    }

    // ---------------------------------------------------------------
    const semana = this.listService.intervaloSemana();
    this.semanaCalendar = semana[0].id;
    const diaSemana = this.listService.diasSemana;

    let newData: any = {};
    for (let i = 0; i < semana.length; i++) {

      newData[semana[i].id] = {};

      for (let j = 0; j < diaSemana.length; j++) {

        newData[semana[i].id][diaSemana[j].id] = {};

        for (let k = 0; k < this.horariosList.length; k++) {
          newData[semana[i].id][diaSemana[j].id][this.horariosList[k]] = { checked: false };
        }

      }
    }
    this.data = newData;
    // ---------------------------------------------------------------
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
