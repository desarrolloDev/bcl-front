import { Component, OnInit, Input } from '@angular/core';
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
    console.log('usuarioSelect', this.usuarioSelect);

    this.semanasList = this.listService.intervaloSemana();
    this.semanaCalendar = this.semanasList[0].id;

    this.selectedtDia = this.diaSemanasList[0].id;

    this.horariosList = await this.getDataService.horariosList();

    await this.dataHorarios();
  }

  async dataHorarios() {
    const semanaString = this.semanasList.map((item: any) => item.id).join(',');

    let dataHorariosProfesor: any[] = [];
    await this.awsService.get(`items?tipo=horario_profesor&profesor=${this.usuarioSelect.profesor_id}&semanas=${semanaString}`)
      .then((response: any) => {
        dataHorariosProfesor = JSON.parse(response.body);
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });

    // LISTA DE HORARIOS PARA EL CALENDARIO
    const newSlots: boolean[][] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newSlots[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${this.semanaCalendar}|${this.diasList[i].id}|${this.horariosList[j]}`);

        if (searchHorario) newSlots[j][i] = true;
        else newSlots[j][i] = false;
      }
    }
    this.selectedSlots = newSlots;

    // LISTA DE HORARIOS PARA EL SELECT
    let newData: any = {};

    // const reservasPendientes = this.listService.reservasPendientes(this.usuarioSelect.horarios);

    // for (let i = 0; i < this.semanasList.length; i++) { // 12|05|2025 - 18|05|2025
    //   const semana = this.semanasList[i].id;
    //   newData[semana] = {};

    //   const buscarSemana = dataHorariosProfesor.filter((item: any) => {
    //     if (!item?.semana_profesor) return false;
    //     return item.semana_profesor.includes(semana);
    //   });

    //   for (let j = 0; j < this.diaSemanasList.length; j++) { // LUNES
    //     newData[semana][this.diaSemanasList[j].id] = {};

    //     for (let k = 0; k < this.horariosList.length; k++) { // 8:00am - 9:25am
    //       const horario = this.horariosList[k];

    //       // Validar si se puede seleccionar el horario ---------------------------------------
    //       let puedeReservar = true;
    //       let checked = false;

    //       const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${semana}|${this.diaSemanasList[j].id}|${horario}`);

    //       if (searchHorario) {
    //         checked = true;

    //         const searchReservaPaso= reservasPendientes.find((r: any) => r.horario === `${semana}|${this.diaSemanasList[j].id}|${horario}`);
            
    //         if (searchReservaPaso) puedeReservar = false;

    //       } else {
    //         const searchHorarioPro = dataHorariosProfesor.find((item: any) => {
    //           if (!item?.semana_profesor) return false;
    //         })

    //         const alumnosReserva = horarios[clave].alumnos;

    //           if (alumnosReserva.length > 0) {
                
    //             if (((horarios[clave].tipo == 'Individual' || 
    //               horarios[clave].tipo == 'Promo Primera Clase' ||
    //               horarios[clave].tipo == 'Clase Individual Gratuita'
    //             ) && alumnosReserva.length == 1) 
    //             ||
    //             ((horarios[clave].tipo == 'Grupal hasta 5' ||
    //               horarios[clave].tipo == 'Clase Grupal Gratuita'
    //             ) && alumnosReserva.length == 5)) {
    //               status = 'reservado';
    //             } else if ((horarios[clave].tipo == 'Grupal hasta 5' ||
    //               horarios[clave].tipo == 'Clase Grupal Gratuita'
    //             ) && alumnosReserva.length > 1 && alumnosReserva.length < 5) {
    //               status = 'disponible';
    //             }
    //           } else {
    //             let puedeReservar = true;

    //             // Validar si se puede reservar
    //             const esSemanaActual = semana === semana_actual;

    //             if (esSemanaActual) {
    //               const valorMatriz = matrizAccesos[this.listService.diasIndice(dia_actual)][this.listService.diasIndice(dia)];

    //               if (valorMatriz == 'NO') puedeReservar = false;
    //               else if (valorMatriz == 'CONSULTAR') puedeReservar = ahoraHora < horaLimite;
    //             }

    //             const esSemanaPosterior = semana === semana_posterior;
    //             if (esSemanaPosterior && dia_actual == 'DOMINGO' && dia == 'LUNES') puedeReservar = ahoraHora < horaLimite;

    //             if (!puedeReservar) {
    //               status = 'bloqueado';
    //             } else {
    //               status = 'disponible';
    //             }
    //           }
    //       } 







          

    //       if (semana === semana_actual) {
    //         puedeReservar = false;
    //       } else if (semana === semana_posterior) {
            
    //         if (diaActualNombre == 'LUNES') {
    //           puedeReservar = ahoraHora < horaLimite;
    //         } else puedeReservar = false;
    //       }

    //       // ----------------------------------------------------------------------------------

          
    //       let tipo = 'Individual';

    //       if (buscarSemana.length > 0 && Object.keys(buscarSemana[0].horarios).length > 0) {
    //         const searchHorario = buscarSemana[0].horarios[`${diaSemana[j].id}|${horario}`] ?? null;
            
    //         if (searchHorario !== null) {
    //           checked = true;
    //           tipo = searchHorario.tipo;

    //           if (searchHorario.alumnos.length > 0) { // Si hay un alumno asignado, no se puede eliminar el horario
    //             puedeReservar = false;
    //           }
    //         }
    //       }

    //       newData[semana][diaSemana[j].id][horario] = {
    //         checked: checked,
    //         isDisabled: !puedeReservar ? true : false,
    //         type: tipo
    //       };
    //     }
    //   }
    // }

    // const semana_actual = this.listService.obtenerRangoActual();
    // const semana_posterior = this.listService.obtenerSemanaSiguiente(semana_actual);
    // const dia_actual = this.listService.obtenerDiaActual();
    // const ahora = new Date();
    // const ahoraHora = ahora.getHours();
    // const horaLimite = 9;
    // const matrizAccesos = this.listService.obtenerCondicional();

    

    // const dataNewHorarios: any = {};
    // for (let itemProfHorario of dataHorariosProfesor) {

    //   if (itemProfHorario.semana_profesor) {
    //     const semana = itemProfHorario.semana_profesor.split('#')[0];
    //     const profesor = itemProfHorario.semana_profesor.split('#')[1];
            
    //     if (itemProfHorario.horarios) {
    //       const horarios = itemProfHorario.horarios;
    //       for (const clave of Object.keys(horarios)) {
      
    //         const dia = clave.split('|')[0];
    //         const hora = clave.split('|')[1];
            
    //         // **************************************************************************
    //         // VALIDACIÓN PARA RESERVAR
    //         // 'disponible' | 'reservado' | 'seleccionado' | 'bloqueado'

    //         let status = '';

    //         const searchHorario = this.usuarioSelect.horarios.find((h: any) => h === `${semana}|${dia}|${hora}`);

    //         if (searchHorario) {
    //           const searchReservaPaso= statusReservas.find((r: any) => r.horario === `${semana}|${dia}|${hora}`);
    //           if (searchReservaPaso) {
    //             status = 'reservado';
    //           } else {
    //             status = 'seleccionado';
    //           }

    //         } else {
              
    //         }
            
    //         // console.log('status', status);
    //         // **************************************************************************
      
    //         if (!dataNewHorarios[horarios[clave].tipo]) {
    //           dataNewHorarios[horarios[clave].tipo] = {  
    //             [profesor]: {}
    //           };
    //           dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
    //           dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
    //           dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
    //         } else {
    //           const buscandoProf = dataNewHorarios[horarios[clave].tipo][profesor];

    //           if (typeof buscandoProf !== 'object' || Object.keys(buscandoProf).length == 0) {
    //             dataNewHorarios[horarios[clave].tipo][profesor] = {};
    //             dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
    //             dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
    //             dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
    //           } else {
    //             const buscandoSemana = dataNewHorarios[horarios[clave].tipo][profesor][semana];
                
    //             if (typeof buscandoSemana !== 'object' || Object.keys(buscandoSemana).length == 0) {
    //               dataNewHorarios[horarios[clave].tipo][profesor][semana] = {};
    //               dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
    //               dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
    //             } else {
    //               const buscandoDia = dataNewHorarios[horarios[clave].tipo][profesor][semana][dia];
                  
    //               if (typeof buscandoDia !== 'object') {
    //                 dataNewHorarios[horarios[clave].tipo][profesor][semana][dia] = {};
    //                 dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
    //               } else {
    //                 const buscadoHorario = dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora];
                    
    //                 if (typeof buscadoHorario !== 'string') {
    //                   dataNewHorarios[horarios[clave].tipo][profesor][semana][dia][hora] = status;
    //                 }
    //               }
    //             }
    //           }
    //         }

    //       }
    //     }   
    //   }
    // }

    // this.data = dataNewHorarios;



    

    // this.data = newData;
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
