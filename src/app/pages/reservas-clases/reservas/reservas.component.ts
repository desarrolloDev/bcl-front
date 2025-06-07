import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SelectComponent } from '../../../ui/select/select.component';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarAlumnoComponent } from '../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../services/getData.service';
import { ListService } from '../../../services/list.service';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    InputComponent,
    CalendarAlumnoComponent
  ],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent implements OnInit {
  @Output() cambiarVista = new EventEmitter<number>();

  curso: string = '';
  colegio: string = '';
  gradoCiclo: string = '';
  tema: string = '';
  tipoClase: string = '';
  recompensa: string = 'no';
  paqueteClase: string = '';
  profesor: string = '';
  precio: number = 0; // ***********************

  listBasePaqueteClase: any = [];

  listCurso: any = [];
  listGradoCiclo: any = [];
  listTipoClase: any = []; // data_alumnos/tipo_clase
  listRecompensa: any = [];
  listPaqueteClase: any = [];
  listProfesor: any = [];

  clasesReservadas: number = 0;
  clasesTotal: number = 0;

  horariosList: string[] = []; // horarios de clase
  semanasList: { id: string, nombre: string }[] = []; // intervalos de semanas
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
    public listService: ListService,
    private getDataService: GetDataService,
    private fs: FirestoreService
  ) { }

  async ngOnInit() {
    // LISTAR DATOS DEL USUARIO | SI ES SU 1RA CLASE 
      this.listTipoClase = [];
      this.listRecompensa = [{ nombre: 'No', id: 'no' }, { nombre: 'Si', id: 'si' }];

      // this.listTipoClase = [{ nombre: 'Promo mi primera clase', id: 'Promo mi primera clase' }];
      // this.listRecompensa = [{ nombre: 'No', id: 'no' }];
    // ---------------------------------------------

    const cursos = await this.getDataService.getCursosAlumnos();
    this.listCurso = cursos.length > 0 ? cursos.map((item: any) => ({ nombre: item, id: item })) : [];

    this.semanasList = this.listService.intervaloSemana();
    this.semanaCalendar = this.semanasList[0].id;

    const horarios = await this.getDataService.horariosList();
    this.horariosList = horarios;

    this.semanaBloqueado();
  }

  semanaBloqueado() {
    const newData: any = {};
    for (let hora of this.horariosList) {
      newData[hora] = {};
      for (let dia of this.listService.diasSemana) {
        newData[hora][dia.id] = 'bloqueado';
      }
    }
    this.selectedSlots = newData;
  }

  async changeCursos(): Promise<void> {
    const profesores = await this.getDataService.dataProfesoresXcurso(this.curso);
    this.listProfesor = profesores;

    // ****************************
    //  const data = await this.fs.getAllReservasSemana(this.profesor, this.semanasList);

    const grados = await this.getDataService.getPaquetes(this.curso, 'ciclo_grado');
    this.listGradoCiclo = grados.length > 0 ? grados.map((item: any) => ({ nombre: item.name, id: item.name })) : [];

    this.gradoCiclo = ''; this.tipoClase = ''; this.recompensa = 'no'; this.paqueteClase = ''; this.profesor = ''; this.precio = 0;
  }

  async changeTipoClase(): Promise<void> {
    const paquetes = await this.getDataService.getPaquetes(this.curso, 'paquete_clase');
    this.listBasePaqueteClase = paquetes;
    this.listPaqueteClase = paquetes.length > 0 ? paquetes.filter((item) => Number(item[this.tipoClase]) > 0).map((item: any) => ({ nombre: item.name, id: item.name })) : [];

    this.paqueteClase = ''; this.profesor = ''; this.precio = 0;
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

  async searchHorarios(): Promise<void> {
    const data = await this.fs.getAllReservasSemana(this.profesor, this.semanasList);

    // data de las 4 semanas
    const reserva: any[] = []; // ACTUALIZAR VALOR CON DATA

    let newDataSemanales: any = {};

    const semana_actual = this.listService.obtenerRangoActual();
    const semana_posterior = this.listService.obtenerSemanaSiguiente(semana_actual);
    const dia_actual = this.listService.obtenerDiaActual();
    const ahora = new Date();
    const ahoraHora = ahora.getHours();
    const horaLimite = 1;
    const matrizAccesos = this.listService.obtenerCondicional();

    for (let semana of this.semanasList) {

      newDataSemanales[semana.id] = {};

      const dataSemana = data[semana.id];

      for (let dia of this.listService.diasSemana) {

        newDataSemanales[semana.id][dia.id] = {};

        for (let hora of this.horariosList) {

          const horario = `${semana.id}|${dia.id}|${hora}`;
          const searchHorarioReserva = reserva.filter((item) => item == horario);

          if (searchHorarioReserva.length > 0) {
            newDataSemanales[semana.id][dia.id][hora] = 'reservado'; // El alumno ya reservó
          } else {

            let puedeReservar = true;

            // Validar si se puede reservar
            const esSemanaActual = semana.id === semana_actual;

            if (esSemanaActual) {
              const valorMatriz = matrizAccesos[this.listService.diasIndice(dia_actual)][this.listService.diasIndice(dia.id)];

              if (valorMatriz == 'NO') puedeReservar = false;
              else if (valorMatriz == 'CONSULTAR') puedeReservar = ahoraHora < horaLimite;
            }

            const esSemanaPosterior = semana.id === semana_posterior;
            if (esSemanaPosterior && dia_actual == 'DOMINGO' && dia.id == 'LUNES') puedeReservar = ahoraHora < horaLimite;

            if (!puedeReservar) {
              newDataSemanales[semana.id][dia.id][hora] = 'bloqueado';
            } else {
              // **********************
              const buscarHorario = dataSemana.filter((item: any) => item.includes(dia.id) && item.includes(hora) && item.toLowerCase().includes(this.tipoClase));
              if (buscarHorario.length === 0) {
                newDataSemanales[semana.id][dia.id][hora] = 'bloqueado';
              } else {
                const splitHorario = buscarHorario[0].split('|');
                newDataSemanales[semana.id][dia.id][hora] = splitHorario.length > 3 ? 'bloqueado' : 'disponible';
              }
            }
          }
        }
      }
    }

    this.data = newDataSemanales;

    const dataSemanaSelect = newDataSemanales[this.semanaCalendar];

    if (dataSemanaSelect) {
      const newData: any = {};
      for (let hora of this.horariosList) {
        newData[hora] = {};
        for (let dia of this.listService.diasSemana) {
          newData[hora][dia.id] = dataSemanaSelect[dia.id][hora];
        }
      }

      this.selectedSlots = newData;

    } else this.semanaBloqueado();

  }

  actualizarSemana(): void {
    const dataSemanaSelect = this.data[this.semanaCalendar];

    if (dataSemanaSelect) {
      const newData: any = {};
      for (let hora of this.horariosList) {
        newData[hora] = {};
        for (let dia of this.listService.diasSemana) {
          newData[hora][dia.id] = dataSemanaSelect[dia.id][hora];
        }
      }

      this.selectedSlots = newData;

    } else this.semanaBloqueado();
  }

  actualizarHorario([dia, hora, estatus]: [string, string, string]): void {
    this.data[this.semanaCalendar][dia][hora] = estatus;
  }

  changeTipo(tipo: string) { // recompensa - paquete
    this.clasesReservadas = 0;

    if (tipo == 'recompensa') {
      this.precio = 0;
      this.clasesTotal = 1;
    } else {
      const searchPaquete = this.listBasePaqueteClase.filter((paquete: any) => paquete.name == this.paqueteClase);

      if (searchPaquete.length > 0) {
        this.precio = Number(searchPaquete[0][this.tipoClase]);

        const numeroEntero = parseInt(this.paqueteClase.split(' ')[0]);
        this.clasesTotal = numeroEntero;
      } else {
        this.precio = 0;
        this.clasesTotal = 0;
      }
    }
  }

  confirmar() {
    console.log('this.data', this.data);
    console.log('this.selectedSlots', this.selectedSlots);
    const correo = localStorage.getItem('correo');

    const horariosSeleccionados = [];

    for (let semana of this.semanasList) {
      for (let dia of this.listService.diasSemana) {
        for (let hora of this.horariosList) {
          const horario = this.data[semana.id][dia.id][hora];

          if (horario == 'seleccionado') horariosSeleccionados.push(`${semana.id}|${dia.id}|${hora}`)
        }
      }
    }

    this.getDataService.saveReservation({
      fechaReserva: new Date(),
      curso: this.curso,
      colegio: this.colegio,
      gradoCiclo: this.gradoCiclo,
      tema: this.tema,
      tipoClase: this.tipoClase,
      recompensa: this.recompensa,
      paqueteClase: this.paqueteClase,
      profesor: this.profesor,
      precio: this.precio,
      alumno: correo,
      horarios: horariosSeleccionados
    });
    // this.cambiarVista.emit(3);
  }
}
