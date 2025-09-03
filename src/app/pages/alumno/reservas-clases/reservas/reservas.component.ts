import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectComponent } from '../../../../ui/select/select.component';
import { InputComponent } from '../../../../ui/input/input.component';
import { CalendarAlumnoComponent } from '../../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../../services/getData.service';
import { ListService } from '../../../../services/list.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AwsService } from '../../../../services/aws.service';
import { ModalService } from '../../../../ui/modal/modal.service';
import { ButtonBackComponent } from '../../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-reservas',
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
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent implements OnInit {
  @Output() cambiarVista = new EventEmitter<number>();
  @Output() cambiarDetalleReserva = new EventEmitter<any>();

  isSmallScreen: boolean = false;
  isLinear = false;

  curso: string = '';
  colegio: string = '';
  gradoCiclo: string = '';
  tema: string = '';
  tipoClase: string = '';
  recompensa: string = 'no';
  paqueteClase: string = '';
  profesor: string = '';
  precio: number = 0; // ***********************
  stringClasesReservadas: string = '';

  listBasePaqueteClase: any = [];
  listBaseProfesores: any = [];

  listCurso: any = [];
  listGradoCiclo: any = [];
  listTipoClase: any = [];
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

  dataBase: {
    [tipoClase: string]: {
      [profesor: string]: {
        [semana: string]: {
          [dia: string]: {
            [time: string]: string
          }
        }
      }
    }
  } = {};

  loadChange: boolean = false;

  constructor(
    public listService: ListService,
    private getDataService: GetDataService,
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
    const profesoresLista = await this.getDataService.dataProfesores();

    let CursosProfesores: any[] = [];
    await this.awsService.get(`items?tipo=profesores_por_curso&curso=${this.curso}`)
    .then((response: any) => {
      CursosProfesores = JSON.parse(response.body);
    })
    .catch((error) => {
      console.error('Error al guardar cursos', error);
    });

    const profesoresValidos: any[] = [];
    for (let i = 0; i < profesoresLista.length; i++) {
      const searchProf = CursosProfesores.filter((item: any) => item.profesor.includes(profesoresLista[i].id));
      if (searchProf.length > 0) profesoresValidos.push(profesoresLista[i]);
    }

    this.listBaseProfesores = profesoresValidos;

    // *************************************************************************************

    const semanaString = this.semanasList.map((item: any) => item.id).join(',');

    const dataHorariosProfesor: any[] = [];
    for (let i = 0; i < profesoresValidos.length; i++) {
      await this.awsService.get(`items?tipo=horario_profesor&profesor=${profesoresValidos[i].id}&semanas=${semanaString}`)
      .then((response: any) => {
        dataHorariosProfesor.push(...JSON.parse(response.body));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
    }

    // console.log('dataHorariosProfesor', dataHorariosProfesor);

    const semana_actual = this.listService.obtenerRangoActual();
    const semana_posterior = this.listService.obtenerSemanaSiguiente(semana_actual);
    const dia_actual = this.listService.obtenerDiaActual();
    const ahora = new Date();
    const ahoraHora = ahora.getHours();
    const horaLimite = 9;
    const matrizAccesos = this.listService.obtenerCondicional();

    const dataNewHorarios: any = {};
    for (let itemProfHorario of dataHorariosProfesor) {
      // console.log('semana', itemProfHorario);

      if (itemProfHorario.semana_profesor) {
        const semana = itemProfHorario.semana_profesor.split('#')[0];
        const profesor = itemProfHorario.semana_profesor.split('#')[1];
        // console.log('semana', semana, ' | profesor', profesor);
            
        if (itemProfHorario.horarios) {
          const horarios = itemProfHorario.horarios;
          for (const clave of Object.keys(horarios)) {
      
            const dia = clave.split('|')[0];
            const hora = clave.split('|')[1];
            
            // **************************************************************************
            // VALIDACIÓN PARA RESERVAR
            // 'disponible' | 'reservado' | 'seleccionado' | 'bloqueado'
            const alumnosReserva = horarios[clave]?.alumnos ?? [];
            
            let status = '';

            if (alumnosReserva.length > 0) {
              
              if (((horarios[clave].tipo == 'Individual' || 
                horarios[clave].tipo == 'Promo Primera Clase' ||
                horarios[clave].tipo == 'Clase Individual Gratuita'
              ) && alumnosReserva.length == 1) 
              ||
              ((horarios[clave].tipo == 'Grupal hasta 5' ||
                horarios[clave].tipo == 'Clase Grupal Gratuita'
              ) && alumnosReserva.length == 5)) {
                // status = 'reservado';
                status = 'bloqueado';
              } else if ((horarios[clave].tipo == 'Grupal hasta 5' ||
                horarios[clave].tipo == 'Clase Grupal Gratuita'
              ) && alumnosReserva.length > 1 && alumnosReserva.length < 5) {
                status = 'disponible';
              }
            } else {
              let puedeReservar = true;

              // Validar si se puede reservar
              const esSemanaActual = semana === semana_actual;

              if (esSemanaActual) {
                const valorMatriz = matrizAccesos[this.listService.diasIndice(dia_actual)][this.listService.diasIndice(dia)];

                if (valorMatriz == 'NO') puedeReservar = false;
                // else if (valorMatriz == 'CONSULTAR') puedeReservar = ahoraHora < horaLimite;
              }

              // const esSemanaPosterior = semana === semana_posterior;
              // if (esSemanaPosterior && dia_actual == 'DOMINGO' && dia == 'LUNES') puedeReservar = ahoraHora < horaLimite;

              if (!puedeReservar) {
                status = 'bloqueado';
              } else {
                status = 'disponible';
              }
            }
            
            // console.log('status', status);
            // **************************************************************************
      
            if (!dataNewHorarios[horarios[clave].tipo]) {
              dataNewHorarios[horarios[clave].tipo] = {  
                [profesor]: {}
              };
              dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
              dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
              dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
            } else {
              const buscandoProf = dataNewHorarios[horarios[clave].tipo][profesor];

              if (typeof buscandoProf !== 'object' || Object.keys(buscandoProf).length == 0) {
                dataNewHorarios[horarios[clave].tipo][profesor] = {};
                dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
                dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
                dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
              } else {
                const buscandoSemana = dataNewHorarios[horarios[clave].tipo][profesor][semana];
                
                if (typeof buscandoSemana !== 'object' || Object.keys(buscandoSemana).length == 0) {
                  dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
                  dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
                  dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
                } else {
                  const buscandoDia = dataNewHorarios[horarios[clave].tipo][profesor][semana][dia];
                  
                  if (typeof buscandoDia !== 'object') {
                    dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
                    dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
                  } else {
                    const buscadoHorario = dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora];
                    
                    if (typeof buscadoHorario !== 'string') {
                      dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
                    }
                  }
                }
              }
            }

          }
        }   
      }
    }

    this.dataBase = dataNewHorarios;

    // ----------------------------------------------------------------------------------------------------

    const ListaTipoClaseProfesores: any[] = [];
    for (const horario of Object.keys(this.dataBase)) {
      ListaTipoClaseProfesores.push({ id: horario, nombre: horario });
    }
    this.listTipoClase = ListaTipoClaseProfesores;

    // ----------------------------------------------------------------------------------------------------

    const grados = await this.getDataService.getPaquetes(this.curso, 'ciclo_grado');
    this.listGradoCiclo = grados.length > 0 ? grados.map((item: any) => ({ nombre: item.name, id: item.name })) : [];

    const paquetes = await this.getDataService.getPaquetes(this.curso, 'paquete_clase');
    this.listBasePaqueteClase = paquetes;

    // ----------------------------------------------------------------------------------------------------

    this.gradoCiclo = ''; this.tipoClase = ''; this.recompensa = 'no'; this.paqueteClase = ''; this.profesor = ''; this.precio = 0;
  }

  async changeTipoClase(): Promise<void> {
    const ListaProfesores: any[] = [];
    const searchProfesores = this.dataBase[this.tipoClase];
    for (const profesor of Object.keys(searchProfesores)) {
      const searchProf = this.listBaseProfesores.filter((item: any) => item.id == profesor);
      if (searchProf.length > 0) ListaProfesores.push(searchProf[0]);
    }
    this.listProfesor = ListaProfesores;

    // ----------------------------------------------------------------------------------------------------

    const reserva_primera_clase = localStorage.getItem('reserva_primera_clase');
    const validacion_promo_primera_clase = String(reserva_primera_clase) == 'true' ? true :  false;

    if (!validacion_promo_primera_clase && (this.tipoClase == 'Promo Primera Clase' || this.tipoClase == 'Clase Individual Gratuita' || this.tipoClase == 'Clase Grupal Gratuita')) {
      this.listRecompensa = [{ nombre: 'No', id: 'no' }];
    } else {
      this.listRecompensa = [{ nombre: 'No', id: 'no' }, { nombre: 'Si', id: 'si' }];
    }

    // ----------------------------------------------------------------------------------------------------

    this.listPaqueteClase = [];
    this.actualizarPaqueteClase();

    this.paqueteClase = ''; this.profesor = ''; this.precio = 0; this.clasesReservadas = 0; this.clasesTotal = 0;
    this.data = {};
    this.semanaBloqueado();
  }

  changeTipo(tipo: string) { // recompensa - paquete
    this.clasesReservadas = 0;

    if (tipo == 'recompensa') {
      if (this.recompensa == 'si') {
        this.clasesTotal = 1;
        this.precio = 0;
      } else if (this.recompensa == 'no') {
        this.clasesTotal = 0;
        this.precio = 0;
      }
      this.paqueteClase = '';
      this.listPaqueteClase = [];
      this.actualizarPaqueteClase();
    } else {
      if (this.tipoClase == 'Promo Primera Clase') {
        this.clasesTotal = 1;
        this.precio = 90;
      } else if (this.tipoClase == 'Clase Individual Gratuita' || this.tipoClase == 'Clase Grupal Gratuita') {
        this.clasesTotal = 1;
        this.precio = 0;
      } else if (this.tipoClase == 'Individual' || this.tipoClase == 'Grupal hasta 5') {
        if (this.recompensa == 'si') {
          this.precio = 0;
          this.clasesTotal = 1;
        } else {
          const searchPaquete = this.listBasePaqueteClase.filter((paquete: any) => paquete.name == this.paqueteClase);

          if (searchPaquete.length > 0) {
            const tipo = this.tipoClase == 'Individual' ? 'individual' : 'grupal';
            this.precio = Number(searchPaquete[0][tipo]);

            const numeroEntero = parseInt(this.paqueteClase.split(' ')[0]);
            this.clasesTotal = numeroEntero;
          } else {
            this.precio = 0;
            this.clasesTotal = 0;
          }
        }
      }
    }
  }

  actualizarPaqueteClase(): void {
    if (this.tipoClase == 'Promo Primera Clase' || this.tipoClase == 'Clase Individual Gratuita' || this.tipoClase == 'Clase Grupal Gratuita') {
      this.listPaqueteClase = [{ nombre: '1 clase', id: '1 clase'}]
    } else if (this.tipoClase == 'Individual' || this.tipoClase == 'Grupal hasta 5') {
      if (this.recompensa == 'si') {
        this.listPaqueteClase = [{ nombre: '1 clase', id: '1 clase'}];
      } else if (this.recompensa == 'no') {
        const tipo = this.tipoClase == 'Individual' ? 'individual' : 'grupal';

        this.listPaqueteClase = this.listBasePaqueteClase.length > 0
        ? this.listBasePaqueteClase.filter((item: any) => Number(item[tipo]) > 0).map((item: any) => ({ nombre: item.name, id: item.name }))
        : [];
      }
    }
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

    this.data = this.dataBase[this.tipoClase][this.profesor];

    const dataSemanaSelect = this.data[this.semanaCalendar];

    if (dataSemanaSelect) {
      const newData: any = {};
      for (let hora of this.horariosList) {
        newData[hora] = {};
        for (let dia of this.listService.diasSemana) {
          const buscarDia = dataSemanaSelect[dia.id];
          if (!buscarDia) {
            newData[hora][dia.id] = 'bloqueado';
          } else if (buscarDia[hora]) {
            newData[hora][dia.id] = buscarDia[hora];
          } else {
            newData[hora][dia.id] = 'bloqueado';
          }
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
          const buscarDia = dataSemanaSelect[dia.id];
          if (!buscarDia) {
            newData[hora][dia.id] = 'bloqueado';
          } else if (buscarDia[hora]) {
            newData[hora][dia.id] = buscarDia[hora];
          } else {
            newData[hora][dia.id] = 'bloqueado';
          }
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
    console.log('this.selectedSlots', this.selectedSlots);

    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¿Está seguro de reservar este horario?',
      mensaje: '',
      type: '',
      load: this.loadChange,
      msgBtnAceptar: 'Sí, Guardar',
      msgBtCerrar: 'Cancelar'
    }).toPromise();

    if (confirmed) {
      const loadingRef = this.modalService.openLoadingDialog('Guardando...');

      this.loadChange = true;

      const horariosSeleccionados = [];
      for (let semana of this.semanasList) {
        for (let dia of this.listService.diasSemana) {
          for (let hora of this.horariosList) {
            if (!this.data[semana.id] || !this.data[semana.id][dia.id]) continue; // Validar si la semana y el día existen
            if (!this.data[semana.id][dia.id][hora]) continue; // Validar si la hora existe

            const horario = this.data[semana.id][dia.id][hora];

            if (horario == 'seleccionado') horariosSeleccionados.push(`${semana.id}|${dia.id}|${hora}`)
          }
        }
      }
      console.log('horariosSeleccionados', horariosSeleccionados);

      const buscarProf = this.listProfesor.filter((item: any) => item.id == this.profesor);

      const dataReserva = {
        tipo: 'guardarReservas',
        fecha_reserva: new Date().toISOString(),
        colegio: this.colegio,
        tema: this.tema,
        curso: this.curso,
        gradoCiclo: this.gradoCiclo,
        tipoClase: this.tipoClase,
        recompensa: this.recompensa,
        paqueteClase: this.paqueteClase,
        clasesReservadas: this.clasesReservadas,
        clasesTotal: this.clasesTotal,
        precio: this.precio,
        profesor: this.profesor,
        profesor_nombre: buscarProf.length > 0 ? buscarProf[0].nombre : '', // (**)
        alumno: localStorage.getItem('correo'),
        alumno_nombre: `${localStorage.getItem('nombre')} ${localStorage.getItem('apellido')}`, // (**)
        horarios: horariosSeleccionados,
        stringClasesReservadas: this.stringClasesReservadas
      };
      console.log('dataReserva', dataReserva);

      this.awsService.post('items', dataReserva)
        .then((response) => {
          loadingRef.close();
          this.modalService.openResultDialog(true, 'Tu data fue guardada');
          
          this.cambiarDetalleReserva.emit({
            curso: this.curso,
            colegio: this.colegio,
            tema: this.tema,
            paqueteClase: this.paqueteClase,
            stringClasesReservadas: this.stringClasesReservadas,
            tipoClase: this.tipoClase,
            profesor: this.profesor,
            precio: this.precio
          });

          this.cambiarVista.emit(3);
        })
        .catch((error) => {
          console.error('Error al guardar cursos', error);
          loadingRef.close();
          this.modalService.openResultDialog(false, 'Error al registrar reserva, intenta nuevamente más tarde.');
        });
    }
  }
}
