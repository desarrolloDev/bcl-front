import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SelectComponent } from '../../../ui/select/select.component';
import { CalendarAlumnoComponent } from '../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../services/getData.service';
import { ListService } from '../../../services/list.service';
import { CalendarComponent } from '../../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { MatStepperModule } from '@angular/material/stepper';
import { DataService } from '../../../services/data.service';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-calendario-horarios',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    CalendarComponent,
    CheckboxComponent,
    MatStepperModule,
    CalendarAlumnoComponent,
  ],
  templateUrl: './calendario-horarios.component.html',
  styleUrl: './calendario-horarios.component.scss'
})
export class CalendarioHorariosComponent {
  isSmallScreen = false;

  semanasList: { id: string, nombre: string }[] = []; // 4 semanas (1 actual y 3 posteriores)
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  selectedSemana: string = ''; // semana seleccionada

  horariosList: string[] = [];

  semanaCalendar: string = '';
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = []; // items para el calendario

  alumnos: { name: string, select: boolean }[] = [
    { name: 'Thiago Planas', select: false },
    { name: 'Nicole Cavalie', select: false },
    { name: 'Ivanna Nava', select: false },
  ];
  cursos: { name: string, select: boolean }[] = [
    { name: 'Ivanna Nava', select: false },
    { name: 'IB Physics', select: false },
  ];

  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean, type: string }
      }
    }
  } = {};
  
    constructor(
      public listService: ListService,
      private breakpointObserver: BreakpointObserver,
      private dataService: DataService,
      private fs: FirestoreService,
    ) {
      this.breakpointObserver
        .observe([`(max-width: 1364px)`])
        .subscribe(result => {
          this.isSmallScreen = result.matches;
        });
    }

  async ngOnInit() {
    this.dataHorarios();

    const semana = this.listService.intervaloSemana();
    this.semanasList = semana;
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
  }

  async changeSemana(): Promise<void> {
    // const data = await this.fs.getAllReservasSemana(this.selectedProf, [{ id: this.selectedSemana }]);
    // console.log('data', data);

    // // ---------------------------------------------------------------
    // const searchSemanaInicial = data[this.selectedSemana];
              
    // const newSlots: any[] = [];
    // for (let j = 0; j < this.dataService.datosHorarios.length; j++) {
    //   newSlots[j] = [];
    //   for (let i = 0; i < this.diasList.length; i++) {
    //     const searchHorario = searchSemanaInicial.filter((item: string) => item.includes(`${this.diasList[i].id}|${this.dataService.datosHorarios[j]}`))
    //     if (searchHorario.length == 0) newSlots[j][i] = false;
    //     else newSlots[j][i] = true;
    //   }
    // }
    // this.selectedSlots = newSlots;
    // ---------------------------------------------------------------
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


}
