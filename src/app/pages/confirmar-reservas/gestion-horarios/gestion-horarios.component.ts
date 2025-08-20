import { Component, OnInit, Input  } from '@angular/core';
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
import { AwsService } from '../../../services/aws.service';
import { ModalService } from '../../../ui/modal/modal.service';

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
  @Input() usuarioSelect: any = {};

  clasesReservadas: number = 0;
  clasesTotal: number = 0;
  
  isSmallScreen = false;
  isLinear = false;

  checked = false;

  horariosList: string[] = []; // horarios de clase
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana;
  semanasList: { id: string, nombre: string }[] = []; // intervalos de semanas
  diaSemanasList: { id: string, nombre: string }[] = this.listService.diasSemana;
  
  semanaCalendar: string = ''; // semana seleccionada
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = [];
  selectedSemana: string = ''; // semana seleccionada
  selectedtDia: string = ''; // dia seleccionado
  data: {
      [semana: string]: {
        [dia: string]: {
          [time: string]: { checked: boolean, isDisabled: boolean, type: string }
        }
      }
    } = {};

  dataBase: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean, isDisabled: boolean, type: string }
      }
    }
  } = {};

  constructor(
    private getDataService: GetDataService,
    public listService: ListService,
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private fs: FirestoreService,
    private awsService: AwsService,
    private modalService: ModalService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    console.log('this.usuarioSelect', this.usuarioSelect);
    this.clasesReservadas = this.usuarioSelect.clasesReservadas;
    this.clasesTotal = this.usuarioSelect.clasesTotal;

    this.semanasList = this.listService.intervaloSemana();
    this.semanaCalendar = this.semanasList[0].id;
    this.selectedSemana = this.semanasList[0].id;

    this.selectedtDia = this.diaSemanasList[0].id;

    await this.dataHorarios();
  }

  async dataHorarios() {
    const listaHorarios = await this.getDataService.horariosList();

    const semana_posterior = this.listService.obtenerSemanaSiguiente(this.semanaCalendar);
    const matrizAccesos = this.listService.obtenerCondicional();
    const dia_actual = this.listService.obtenerDiaActual();
    const ahora = new Date();
    const ahoraHora = ahora.getHours();
    const horaLimite = 9;

    const semanaString = this.semanasList.map((item: any) => item.id).join(',');

    let dataHorariosProfesor: any[] = [];
    await this.awsService.get(`items?tipo=horario_profesor&profesor=${this.usuarioSelect.profesor_id}&semanas=${semanaString}`)
      .then((response: any) => {
        dataHorariosProfesor = JSON.parse(response.body);
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
    console.log('dataHorariosProfesor', dataHorariosProfesor);
    console.log('this.usuarioSelect.horarios', this.usuarioSelect.horarios);

    // LISTA DE HORARIOS PARA EL CALENDARIO --------------------------------------------------------------------
    const newSlots: boolean[][] = [];
    for (let j = 0; j < listaHorarios.length; j++) {
      newSlots[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${this.semanaCalendar}|${this.diasList[i].id}|${listaHorarios[j]}`);

        if (searchHorario) newSlots[j][i] = true;
        else newSlots[j][i] = false;
      }
    }
    this.selectedSlots = newSlots;
    console.log('newSlots', newSlots);

    // LISTA DE HORARIOS PARA EL SELECT -------------------------------------------------------------------------
    let newData: any = {};

    const reservasPendientes = this.listService.reservasPendientes(this.usuarioSelect.horarios);
    console.log('reservasPendientes', reservasPendientes);

    for (let i = 0; i < this.semanasList.length; i++) { // 12|05|2025 - 18|05|2025
      const semana = this.semanasList[i].id;
      newData[semana] = {};

      const buscarSemana = dataHorariosProfesor.filter((item: any) => {
        if (!item?.semana_profesor) return false;
        return item.semana_profesor.includes(semana);
      });
      console.log('buscarSemana', buscarSemana);

      for (let j = 0; j < this.diaSemanasList.length; j++) { // LUNES
        const dia = this.diaSemanasList[j].id;

        newData[semana][dia] = {};

        for (let k = 0; k < listaHorarios.length; k++) { // 8:00am - 9:25am
          const horario = listaHorarios[k];

          // Validar si se puede seleccionar el horario ---------------------------------------
          let puedeReservar = true;
          let checked = false;

          const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${semana}|${dia}|${horario}`);

          if (searchHorario) {
            checked = true;

            const searchReservaPendiente = reservasPendientes.find((r: any) => r.horario === `${semana}|${dia}|${horario}`);

            if (!searchReservaPendiente) puedeReservar = false;

          } else {
            const alumnosReserva = buscarSemana.length > 0 ? (buscarSemana[0].horarios[`${dia}|${horario}`] ? buscarSemana[0].horarios[`${dia}|${horario}`].alumnos : []) : [];

            if (alumnosReserva.length > 0) {
              const itemHorario = buscarSemana[0].horarios[`${dia}|${horario}`];

              if (((itemHorario.tipo == 'Individual' || itemHorario.tipo == 'Promo Primera Clase' || itemHorario.tipo == 'Clase Individual Gratuita') && alumnosReserva.length == 1) 
                ||
                ((itemHorario.tipo == 'Grupal hasta 5' || itemHorario.tipo == 'Clase Grupal Gratuita') && alumnosReserva.length == 5)) {
                
                puedeReservar = false;

              }

            } else {
              // Validar si se puede reservar
              const esSemanaActual = semana === this.semanaCalendar;

              if (esSemanaActual) {
                const valorMatriz = matrizAccesos[this.listService.diasIndice(dia_actual)][this.listService.diasIndice(dia)];

                if (valorMatriz == 'NO') puedeReservar = false;
                else if (valorMatriz == 'CONSULTAR') puedeReservar = ahoraHora < horaLimite;
              }

              const esSemanaPosterior = semana === semana_posterior;
              if (esSemanaPosterior && dia_actual == 'DOMINGO' && dia == 'LUNES') puedeReservar = ahoraHora < horaLimite;

              if (!puedeReservar) {
                puedeReservar = false;
              }
            }
          } 

          // ---------------------------------------------------------------------------------

          newData[semana][dia][horario] = {
            checked: checked,
            isDisabled: !puedeReservar ? true : false
          };
        }
      }
    }

    console.log('newData', newData);
    this.dataBase = newData;
    this.data = newData;

    this.horariosList = listaHorarios;
    console.log('this.horariosList', this.horariosList);
  }

  changeWeek(offset: number) {
    const newOffset = this.semanaOffset + offset;
    if (newOffset >= 0 && newOffset <= 3) {
      this.semanaOffset = newOffset;
      this.semanaCalendar = this.semanasList[newOffset].id;
      this.actualizarHorarios('', '', '');
    }
  }

  actualizarHorarios(semana: string, dia: string,  horario: string): void {
    if (semana === '' && dia === '' && horario === '') {
      this.actualizarSlots();
    } else {
      const buscarChecked = this.data[semana][dia][horario].checked;

      if (buscarChecked === true && this.clasesReservadas === this.clasesTotal) {
        // this.data[semana][dia][horario].checked = false;
        this.data[semana][dia][horario] = {
          ...this.data[semana][dia][horario],
          checked: false
        };
        this.modalService.openResultDialog(false, 'Límite de clases alcanzado, No puedes reservar más clases.');
      }
      
      if (buscarChecked === true && this.clasesReservadas < this.clasesTotal) {
        this.clasesReservadas += 1;
        this.actualizarSlots();
      }

      if (buscarChecked === false && this.clasesReservadas < this.clasesTotal) {
        this.clasesReservadas -= 1;
        this.actualizarSlots();
      }
      
    }

  }

  actualizarSlots() {
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
