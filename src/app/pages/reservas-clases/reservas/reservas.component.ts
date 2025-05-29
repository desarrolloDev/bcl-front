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
      this.listTipoClase = [{ nombre: 'Individual', id: 'individual' }, { nombre: 'Grupal', id: 'grupal' }];
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

        const grados = await this.getDataService.getPaquetes(this.curso, 'ciclo_grado');
    this.listGradoCiclo = grados.length > 0 ? grados.map((item: any) => ({ nombre: item, id: item })) : [];

  }

  async changeTipoClase(): Promise<void> {
    const paquetes = await this.getDataService.getPaquetes(this.curso, 'paquete_clase');
    this.listBasePaqueteClase = paquetes;
    this.listPaqueteClase = paquetes.length > 0 ? paquetes.filter((item) => Number(item[this.tipoClase]) > 0).map((item: any) => ({ nombre: item.name, id: item.name })) : [];
  }

  changeWeek(offset: number) {
    const newOffset = this.semanaOffset + offset;
    if (newOffset >= 0 && newOffset <= 3) {
      this.semanaOffset = newOffset;
      this.semanaCalendar = this.semanasList[newOffset].id;
      this.actualizarSemana();
    }
  }

  async searchHorarios(): Promise<void> {
    const data = await this.fs.getAllReservasSemana(this.profesor, this.semanasList);

    // data de las 4 semanas
    const reserva: any[] = [];
    let newDataSemanales: any = {};

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

            const buscarHorario = dataSemana.filter((item: any) => item.includes(dia.id) && item.includes(hora) && (item.toLowerCase()).includes(this.tipoClase));
            
            if (buscarHorario.length == 0) newDataSemanales[semana.id][dia.id][hora] = 'bloqueado';
            else newDataSemanales[semana.id][dia.id][hora] = 'disponible'

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
    const correo = localStorage.getItem('correo');

    const horariosSeleccionados = [];
    // for (let hora of this.horariosList) {
    //   for (let dia of this.listService.diasSemana) { // LUNES|8:00am - 9:25am|Individual
    //     const buscarHorario = dataSemanaSelect.filter((item: any) => item.includes(dia.id) && item.includes(hora) && (item.toLowerCase()).includes(this.tipoClase));
    //     if (buscarHorario.length == 0) newData[hora][dia.id] = 'bloqueado';
    //     else newData[hora][dia.id] = 'disponible';
    //   }
    // }

    // this.getDataService.saveReservation({
    //   curso: this.curso,
    //   colegio: this.colegio,
    //   gradoCiclo: this.gradoCiclo,
    //   tema: this.tema,
    //   tipoClase: this.tipoClase,
    //   recompensa: this.recompensa,
    //   paqueteClase: this.paqueteClase,
    //   profesor: this.profesor,
    //   precio: this.precio,
    //   alumno: correo,
    //   horarios: []
    // });
    // this.cambiarVista.emit(3);
  }
}
