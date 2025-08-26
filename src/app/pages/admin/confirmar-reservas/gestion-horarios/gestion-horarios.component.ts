import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '../../../../ui/select/select.component';
import { InputComponent } from '../../../../ui/input/input.component';
import { CalendarComponent } from '../../../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../../../ui/checkbox/checkbox.component';
import { GetDataService } from '../../../../services/getData.service';
import { ListService } from '../../../../services/list.service';
import { AwsService } from '../../../../services/aws.service';
import { ModalService } from '../../../../ui/modal/modal.service';

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
    MatStepperModule,
    MatCheckbox,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.scss'
})
export class GestionHorariosComponent implements OnInit {
  @Input() usuarioSelect: any = {};

  loadChange: boolean = false;

  clasesReservadas: number = 0;
  clasesTotal: number = 0;
  
  isSmallScreen = false;
  isLinear = false;
  
  semanasList: { id: string, nombre: string }[] = []; // intervalos de semanas
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  horariosList: string[] = []; // horarios de clase
  
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

    this.selectedtDia = this.diasList[0].id;

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

      for (let j = 0; j < this.diasList.length; j++) { // LUNES
        const dia = this.diasList[j].id;

        newData[semana][dia] = {};

        for (let k = 0; k < listaHorarios.length; k++) { // 8:00am - 9:25am
          const horario = listaHorarios[k];

          // Validar si se puede seleccionar el horario ---------------------------------------
          let puedeReservar = true;
          let checked = false;

          const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${semana}|${dia}|${horario}`);
          console.log('***************searchHorario', searchHorario, '-', `${semana}|${dia}|${horario}`);

          if (searchHorario) {
            checked = true;

            const searchReservaPendiente = reservasPendientes.find((r: any) => r === `${semana}|${dia}|${horario}`);
            console.log('searchReservaPendiente', searchReservaPendiente);

            if (!searchReservaPendiente) puedeReservar = false;

          } else {

            const itemHorario = buscarSemana.length > 0 ? buscarSemana[0].horarios[`${dia}|${horario}`] : {};
            console.log('itemHorario', itemHorario);

            if (itemHorario?.tipo === this.usuarioSelect.tipo) { // verificamos si el horario del profesor es del mismo tipo de clase

              const alumnosReserva =  itemHorario.alumnos || [];
              console.log('alumnosReserva', alumnosReserva);

              if (alumnosReserva.length > 0) {

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

            } else { // si no es el mismo tipo de clase no se puede reservar
              puedeReservar = false;
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
    this.dataBase = JSON.parse(JSON.stringify(newData));
    this.data = newData;

    this.horariosList = listaHorarios;
    console.log('this.horariosList', this.horariosList);
  }

  changeWeek(offset: number) {
    const newOffset = this.semanaOffset + offset;
    if (newOffset >= 0 && newOffset <= 3) {
      this.semanaOffset = newOffset;
      this.semanaCalendar = this.semanasList[newOffset].id;
      this.actualizarSlots();
    }
  }

  actualizarHorarios(checked: boolean, semana: string, dia: string,  horario: string): void {
    console.log('............ checked', checked);
    console.log(semana, dia, horario);

    if (checked) {
      if (this.clasesReservadas == this.clasesTotal - 1) { // deshabilitamos para que ya no se pueda seleccionar más

        this.clasesReservadas += 1;

        const dataDesactivada: any = {};
        for (let semana = 0; semana < this.semanasList.length; semana++) {
          dataDesactivada[this.semanasList[semana].id] = {};
          for (let dia = 0; dia < this.diasList.length; dia++) {
            dataDesactivada[this.semanasList[semana].id][this.diasList[dia].id] = {};
            for (let horario = 0; horario < this.horariosList.length; horario++) {

              const searchdata = this.data[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];

              dataDesactivada[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]] = {
                checked: searchdata.checked,
                isDisabled: searchdata.checked == true ? false : true
              };
            }
          }
        }
        this.data = dataDesactivada;

        this.modalService.openResultDialog(false, 'Límite de clases alcanzado, No puedes reservar más clases.');

      } else if (this.clasesReservadas < this.clasesTotal - 1) { // se puede seguir seleccionando

        this.clasesReservadas += 1;
      }
    } else {
      if (this.clasesReservadas == this.clasesTotal) { // si ya estaba en el límite, habilitamos los demás

        this.clasesReservadas -= 1;
        
        const dataActivada: any = {};
        for (let semana = 0; semana < this.semanasList.length; semana++) {
          dataActivada[this.semanasList[semana].id] = {};
          for (let dia = 0; dia < this.diasList.length; dia++) {
            dataActivada[this.semanasList[semana].id][this.diasList[dia].id] = {};
            for (let horario = 0; horario < this.horariosList.length; horario++) {

              const searchdata = this.data[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];
              const searchdataBase = this.dataBase[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];

              dataActivada[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]] = {
                checked: searchdata.checked,
                isDisabled: searchdataBase.isDisabled
              };
            }
          }
        }
        this.data = dataActivada;

      } else if (this.clasesReservadas < this.clasesTotal) {

        this.clasesReservadas -= 1;

      }
    }

    this.actualizarSlots();
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

  async guardarHorarios() {
    const inicial: string[] = [];
    const final: string[] = [];

    for (let semana = 0; semana < this.semanasList.length; semana++) {
      for (let dia = 0; dia < this.diasList.length; dia++) {
        for (let horario = 0; horario < this.horariosList.length; horario++) {

          const searchdataBase = this.dataBase[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];
          if (searchdataBase.checked) inicial.push(`${this.semanasList[semana].id}|${this.diasList[dia].id}|${this.horariosList[horario]}`);

          const searchdata = this.data[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];
          if (searchdata.checked) final.push(`${this.semanasList[semana].id}|${this.diasList[dia].id}|${this.horariosList[horario]}`);

        }
      }
    }

    // elementos agregados (están en final pero no en inicial)
    const agregados = final.filter(x => !inicial.includes(x));
    // elementos eliminados (están en inicial pero no en final)
    const eliminados = inicial.filter(x => !final.includes(x));

    console.log("Agregados:", agregados);
    console.log("Eliminados:", eliminados);

    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¿Está seguro de guardar estos horarios?',
      mensaje: '',
      type: '',
      load: this.loadChange,
      msgBtnAceptar: 'Sí, Guardar',
      msgBtCerrar: 'Cancelar'
    }).toPromise();

    if (confirmed) {
      const loadingRef = this.modalService.openLoadingDialog('Guardando...');

      const body = {
        tipo: 'actualizarHorariosAlumno',
        fecha_reserva: this.usuarioSelect.fecha_reserva,
        profesor: this.usuarioSelect.profesor_id,
        alumno: this.usuarioSelect.alumno_id,
        alumno_nombre: this.usuarioSelect.alumno,
        curso: this.usuarioSelect.curso,
        fechasNuevas: agregados,
        fechasEliminadas: eliminados,
        fechasTotal: final
      };

      this.awsService.post('items', body)
        .then((response) => {
          loadingRef.close();
          
          this.dataBase = JSON.parse(JSON.stringify(this.data));

          this.modalService.openResultDialog(true, 'Tu data fue guardada');
        })
        .catch((error) => {
          console.error('Error al guardar horarios', error);
          loadingRef.close();
          this.modalService.openResultDialog(false, 'Error al guardar horarios, intenta nuevamente más tarde.');
        });
    }
  }
}
