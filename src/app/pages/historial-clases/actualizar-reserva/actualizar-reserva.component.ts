import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectComponent } from '../../../ui/select/select.component';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarAlumnoComponent } from '../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../services/getData.service';

@Component({
  selector: 'app-actualizar-reserva',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    InputComponent,
    CalendarAlumnoComponent,
    MatStepperModule
  ],
  templateUrl: './actualizar-reserva.component.html',
  styleUrl: './actualizar-reserva.component.scss'
})
export class ActualizarReservaComponent implements OnInit {
  @Output() cambiarVista = new EventEmitter<number>();

  isSmallScreen: boolean = false;
  isLinear = false;

  curso: string = 'IB MATH SL';
  colegio: string = 'Colegio A';
  gradoCiclo: string = 'Grado 10';
  tema: string = 'Matemáticas';
  tipoClase: string = 'Individual';
  recompensa: string = 'no';
  paqueteClase: string = '20 Clases';
  profesor: string = 'Judith Portocarrero';
  precio: number = 0;

  listBasePaqueteClase: any = [];

  listCurso: any = [];
  listGradoCiclo: any = [];
  listTipoClase: any = [];
  listRecompensa: any = [];
  listPaqueteClase: any = [];
  listProfesor: any = [];

  clasesReservadas: number = 0;
  clasesTotal: number = 0;

  horariosList: string[] = []; // horarios de clase
  semanasList: { id: string, nombre: string }[] = [{ id: 'LUNES', nombre: 'Lunes' }, { id: 'MARTES', nombre: 'Martes' }, { id: 'MIERCOLES', nombre: 'Miércoles' }, { id: 'JUEVES', nombre: 'Jueves' }, { id: 'VIERNES', nombre: 'Viernes' }, { id: 'SABADO', nombre: 'Sábado' }, { id: 'DOMINGO', nombre: 'Domingo' }]; // intervalos de semanas
  semanaCalendar: string = ''; // semana seleccionada
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = [];
  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: string
      }
    }
  } = {};

  constructor(
    private getDataService: GetDataService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    this.listTipoClase = [];
    this.listRecompensa = [{ nombre: 'No', id: 'no' }, { nombre: 'Si', id: 'si' }];

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
      this.actualizarSemana();
    }
  }

  updateReservas(tipoAccion: string) {
    if (tipoAccion == 'suma') this.clasesReservadas += 1;
    else if (tipoAccion == 'resta') this.clasesReservadas -= 1;
  }

  actualizarSemana(): void {
    const dataSemanaSelect = this.data[this.semanaCalendar];

    if (dataSemanaSelect) {
      const newData: any = {};
      for (let hora of this.horariosList) {
        newData[hora] = {};
        for (let dia of this.semanasList) {
          newData[hora][dia.id] = dataSemanaSelect[dia.id][hora];
        }
      }

      this.selectedSlots = newData;

    } else this.semanaBloqueado();
  }

  actualizarHorario([dia, hora, estatus]: [string, string, string]): void {
    this.data[this.semanaCalendar][dia][hora] = estatus;
  }

  confirmar() {
    this.cambiarVista.emit(1);
  }
}
