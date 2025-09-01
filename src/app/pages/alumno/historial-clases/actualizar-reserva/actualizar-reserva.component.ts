import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectComponent } from '../../../../ui/select/select.component';
import { InputComponent } from '../../../../ui/input/input.component';
import { CalendarAlumnoComponent } from '../../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../../services/getData.service';
import { ListService } from '../../../../services/list.service';
import { AwsService } from '../../../../services/aws.service';
import { ModalService } from '../../../../ui/modal/modal.service';
import { ButtonBackComponent } from '../../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-actualizar-reserva',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    InputComponent,
    CalendarAlumnoComponent,
    MatStepperModule,
    ButtonBackComponent
  ],
  templateUrl: './actualizar-reserva.component.html',
  styleUrl: './actualizar-reserva.component.scss'
})
export class ActualizarReservaComponent implements OnInit {
  @Output() cambiarVista = new EventEmitter<number>();
  @Input() usuarioSelect: any = {};

  isSmallScreen: boolean = false;
  isLinear: boolean = false;
  isDisabled: boolean = true;

  loadChange: boolean = false;

  curso: string = '';
  colegio: string = '';
  gradoCiclo: string = '';
  tema: string = '';
  tipoClase: string = '';
  recompensa: string = '';
  paqueteClase: string = '';
  profesor: string = '';
  precio: number = 0;
  stringClasesReservadas: string = '';

  clasesReservadas: number = 0;
  clasesTotal: number = 0;

  semanasList: { id: string, nombre: string }[] = []; // intervalos de semanas
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  horariosList: string[] = []; // horarios de clase

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
    console.log('Usuario seleccionado:', this.usuarioSelect);
    this.curso = this.usuarioSelect.curso;
    this.colegio = this.usuarioSelect.colegio;
    this.gradoCiclo = this.usuarioSelect.gradoCiclo;
    this.tema = this.usuarioSelect.tema;
    this.tipoClase = this.usuarioSelect.tipo;
    this.recompensa = this.usuarioSelect.recompensa;
    this.paqueteClase = this.usuarioSelect.paquete;
    this.profesor = this.usuarioSelect.profesor;
    this.precio = this.usuarioSelect.precio;

    this.clasesReservadas = this.usuarioSelect.clasesReservadas;
    this.clasesTotal = this.usuarioSelect.clasesTotal;

    this.semanasList = this.listService.intervaloSemana();
    this.semanaCalendar = this.semanasList[0].id;

    await this.dataHorarios();
  }

  async dataHorarios() {
    const listaHorarios = await this.getDataService.horariosList();
    this.horariosList = listaHorarios;
    this.semanaBloqueado();

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
    // console.log('dataHorariosProfesor', dataHorariosProfesor);
    // console.log('this.usuarioSelect.horarios', this.usuarioSelect.horarios);

    // LISTA DE HORARIOS PARA EL SELECT -------------------------------------------------------------------------
    let newData: any = {};

    for (let i = 0; i < this.semanasList.length; i++) { // 12|05|2025 - 18|05|2025
      const semana = this.semanasList[i].id;
      newData[semana] = {};

      const buscarSemana = dataHorariosProfesor.filter((item: any) => {
        if (!item?.semana_profesor) return false;
        return item.semana_profesor.includes(semana);
      });
      // console.log('buscarSemana', buscarSemana);

      for (let j = 0; j < this.diasList.length; j++) { // LUNES
        const dia = this.diasList[j].id;

        newData[semana][dia] = {};

        for (let k = 0; k < listaHorarios.length; k++) { // 8:00am - 9:25am
          const horario = listaHorarios[k];

          // Validar si se puede seleccionar el horario ---------------------------------------
          // 'disponible' | 'reservado' | 'seleccionado' | 'bloqueado'
          let puedeReservar = true;
          let status = 'disponible';

          const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${semana}|${dia}|${horario}`);

          if (searchHorario) {

            status = 'reservado';
            puedeReservar = false;

          } else {

            const itemHorario = buscarSemana.length > 0 ? buscarSemana[0].horarios[`${dia}|${horario}`] : {};
            // console.log('itemHorario', itemHorario);

            if (itemHorario?.tipo === this.usuarioSelect.tipo) { // verificamos si el horario del profesor es del mismo tipo de clase

              const alumnosReserva =  itemHorario.alumnos || [];
              console.log('alumnosReserva', alumnosReserva);

              if (alumnosReserva.length > 0) {

                if (((itemHorario.tipo == 'Individual' || itemHorario.tipo == 'Promo Primera Clase' || itemHorario.tipo == 'Clase Individual Gratuita') && alumnosReserva.length == 1) 
                  ||
                  ((itemHorario.tipo == 'Grupal hasta 5' || itemHorario.tipo == 'Clase Grupal Gratuita') && alumnosReserva.length == 5)) {
                  
                  status = 'bloqueado';
                  puedeReservar = false;

                }
              } else {
                // Validar si se puede reservar
                const esSemanaActual = semana === this.semanaCalendar;

                if (esSemanaActual) {
                  const valorMatriz = matrizAccesos[this.listService.diasIndice(dia_actual)][this.listService.diasIndice(dia)];

                  if (valorMatriz == 'NO') {
                    status = 'bloqueado';
                    puedeReservar = false;
                  } else if (valorMatriz == 'CONSULTAR') {
                    puedeReservar = ahoraHora < horaLimite;
                    status = puedeReservar ? 'disponible' : 'bloqueado';
                  }
                }

                const esSemanaPosterior = semana === semana_posterior;
                if (esSemanaPosterior && dia_actual == 'DOMINGO' && dia == 'LUNES') {
                  puedeReservar = ahoraHora < horaLimite;
                  status = puedeReservar ? 'disponible' : 'bloqueado';
                }

                if (!puedeReservar) {
                  puedeReservar = false;
                  status = 'bloqueado';
                }
              }

            } else { // si no es el mismo tipo de clase no se puede reservar
              puedeReservar = false;
              status = 'bloqueado';
            }

          } 

          // ---------------------------------------------------------------------------------

          newData[semana][dia][horario] = status;
        }
      }
    }

    console.log('newData', newData);
    this.data = newData;

    // LISTA DE HORARIOS PARA EL CALENDARIO --------------------------------------------------------------------
    this.actualizarSemana();
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
        for (let dia of this.diasList) {
          newData[hora][dia.id] = dataSemanaSelect[dia.id][hora];
        }
      }
      this.selectedSlots = newData;

    } else this.semanaBloqueado();
  }

  actualizarHorario([dia, hora, estatus]: [string, string, string]): void {
    this.data[this.semanaCalendar][dia][hora] = estatus;
    if (estatus == 'seleccionado') {
      this.stringClasesReservadas += ` ${this.semanaCalendar}|${dia}|${hora}#`;
    } else if (estatus == 'disponible' || estatus == 'reservado' || estatus == 'bloqueado') {
      const regex = new RegExp(`${this.semanaCalendar}\\|${dia}\\|${hora}#?`, 'g');
      this.stringClasesReservadas = this.stringClasesReservadas.replace(regex, '');
    }
  }

  async confirmar() {

    const agregados: string[] = [];
    const final: string[] = [];

    for (let semana = 0; semana < this.semanasList.length; semana++) {
      for (let dia = 0; dia < this.diasList.length; dia++) {
        for (let horario = 0; horario < this.horariosList.length; horario++) {

          const searchdata = this.data[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];
          if (searchdata == 'seleccionado') agregados.push(`${this.semanasList[semana].id}|${this.diasList[dia].id}|${this.horariosList[horario]}`);
          if (searchdata == 'seleccionado' || searchdata == 'reservado') final.push(`${this.semanasList[semana].id}|${this.diasList[dia].id}|${this.horariosList[horario]}`);

        }
      }
    }

    console.log("Agregados:", agregados);
    console.log("final:", final);

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
        fechasEliminadas: [],
        fechasTotal: final,
        tema: this.tema
      };

      this.awsService.post('items', body)
        .then((response) => {
          loadingRef.close();
          this.modalService.openResultDialog(true, 'Tu data fue guardada');
          // this.cambiarVista.emit(1);
        })
        .catch((error) => {
          console.error('Error al guardar horarios', error);
          loadingRef.close();
          this.modalService.openResultDialog(false, 'Error al guardar horarios, intenta nuevamente más tarde.');
        });
    }
  }
}
