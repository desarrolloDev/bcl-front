import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectComponent } from '../../../../ui/select/select.component';
import { CalendarAlumnoComponent } from '../../../../ui/calendar-alumno/calendar-alumno.component';
import { GetDataService } from '../../../../services/getData.service';
import { ListService } from '../../../../services/list.service';
import { CalendarStatusComponent } from '../../../../ui/calendar-status/calendar-status.component';
import { CheckboxComponent } from '../../../../ui/checkbox/checkbox.component';
import { DataService } from '../../../../services/data.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { ModalService } from '../../../../ui/modal/modal.service';
import { AwsService } from '../../../../services/aws.service';
import { ButtonBackComponent } from '../../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-calendario-horarios',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SelectComponent,
    CalendarStatusComponent,
    CheckboxComponent,
    MatStepperModule,
    CalendarAlumnoComponent,
    ButtonBackComponent
  ],
  templateUrl: './calendario-horarios.component.html',
  styleUrl: './calendario-horarios.component.scss'
})
export class CalendarioHorariosComponent {
  isSmallScreen = false;

  semanasList: { id: string, nombre: string }[] = []; // 4 semanas (1 actual y 3 posteriores)
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  horariosList: string[] = []; // horarios de clase

  semanaCalendar: string = '';
  semanaOffset: number = 0;
  selectedSlots: [][] = []; // items para el calendario

  alumnos: { name: string, select: boolean }[] = [];
  cursos: { name: string, select: boolean }[] = [];

  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean; text: string}
      }
    }
  } = {};
  
  constructor(
    public listService: ListService,
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private fs: FirestoreService,
    private awsService: AwsService,
    private modalService: ModalService,
    private getDataService: GetDataService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  parseFechaDMY(fecha: string): Date { // Asume formato 'dd/mm/yyyy'
    const [dia, mes, anio] = fecha.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  async ngOnInit() {
    this.dataHorarios();

    this.semanasList = this.listService.intervaloSemana();
    // console.log('semanasList', this.semanasList);
    this.semanaCalendar = this.semanasList[0].id;

    await this.dataHorarios();
  }

  async dataHorarios() {
    const listaHorarios = await this.getDataService.horariosList();
    this.horariosList = listaHorarios;
    this.semanaBloqueado();

    // const fechaInicio = this.semanasList[0].id.split('-')[0];
    // const fechaFin = this.semanasList[this.semanasList.length -1].id.split('-')[1];
    // console.log('fechaInicio', fechaInicio);
    // console.log('fechaFin', fechaFin);

    // const desde = this.listService.changeFechasInicio(this.parseFechaDMY(fechaInicio));
    // const hasta = this.listService.changeFechasFin(this.parseFechaDMY(fechaFin));

    // console.log('desde', desde);
    // console.log('hasta', hasta);

    const semanaString = this.semanasList.map((item: any) => item.id).join(',');

    let dataHorariosProfesor: any[] = [];
    await this.awsService.get(`items?tipo=horario_profesor&profesor=${localStorage.getItem('correo')}&semanas=${semanaString}`)
      .then((response: any) => {
        // console.log('Response horarios profesor:', response.body);
        dataHorariosProfesor = JSON.parse(response.body);
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });

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

          const itemHorario = buscarSemana.length > 0 ? buscarSemana[0].horarios[`${dia}|${horario}`] : {};
          // console.log('itemHorario', dia, horario, itemHorario);

          if (itemHorario == undefined || Object.keys(itemHorario).length === 0) {
            newData[semana][dia][horario] = { checked: false, text: '' };
  
          } else {
            const alumnosReserva =  itemHorario.alumnos ?? [];
            if (alumnosReserva.length > 0) {
              newData[semana][dia][horario] = { checked: true, text: alumnosReserva.map((al: string) => `${al.split('|')[0]}|${al.split('|')[1]}`).join(', ') };

              for (const alumno of alumnosReserva) {
                const [nombreAlumno, cursoAlumno, correoAlumno, confirmacion] = alumno.split('|');
                console.log('***alumno--->', confirmacion);
                if (confirmacion === 'CONFIRMADO' || confirmacion === undefined) {
                  const searchAlumno = this.alumnos.filter(item => item.name === nombreAlumno);
                  if (searchAlumno.length === 0) {
                    this.alumnos.push({ name: nombreAlumno, select: false });
                  }
                  const searchCurso = this.cursos.filter(item => item.name === cursoAlumno);
                  if (searchCurso.length === 0) {
                    this.cursos.push({ name: cursoAlumno, select: false });
                  }
                } else {
                  newData[semana][dia][horario] = { checked: true, text: '' };
                }
              }

            } else {
              newData[semana][dia][horario] = { checked: true, text: '' };
            }
          }

          // ---------------------------------------------------------------------------------          
        }
      }
    }

    console.log('***********newData', newData);
    this.data = newData;

    // LISTA DE HORARIOS PARA EL CALENDARIO --------------------------------------------------------------------
    this.actualizarHorarios();
  }

  actualizarHorarios(): void {
    const newData: any[] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        newData[j][i] = this.data[this.semanaCalendar][this.diasList[i].id][this.horariosList[j]]
      }
    }
    this.selectedSlots = newData;
  }

  semanaBloqueado() {
    const newData: any[] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        newData[j][i] = { checked: false, text: '' }
      }
    }
    this.selectedSlots = newData;
  }

  async changeSemana(): Promise<void> {
    await this.actualizarHorarios();
  }

  changeAlumnoCurso(): void {
    console.log('Cambiar alumno/curso');
    const newData: any[] = [];

    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        const semana = this.data[this.semanaCalendar][this.diasList[i].id][this.horariosList[j]];

        if (semana.text === '') {
          newData[j][i] = { checked: semana.checked, text: semana.text };
        } else {
          const buscarAlumno = this.alumnos.filter(item => item.select == true);
          const buscarCurso = this.cursos.filter(item => item.select == true);

          if (buscarAlumno.length == 0 && buscarCurso.length == 0) {
            newData[j][i] = { checked: semana.checked, text: semana.text  };
          } else {
            const nuevoAlumnosArray = semana.text.split(', ');

            const textoFinalArray: string[] = [];

            for (const alumno of nuevoAlumnosArray) {
              const [nombre, curso] = alumno.split('|');

              const matchCurso = buscarCurso.some(item => item.name === curso);
              const matchAlumno = buscarAlumno.some(item => item.name === nombre);

              if ((buscarAlumno.length > 0 && matchAlumno) || (buscarCurso.length > 0 && matchCurso)) textoFinalArray.push(alumno);
            }

            newData[j][i] = { checked: semana.checked, text: textoFinalArray.join(', ')  };
          }
        }
      }
    }
    this.selectedSlots = newData;   

  }
}
