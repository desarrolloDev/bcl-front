import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { CalendarComponent } from '../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { ListService } from '../../services/list.service';
import { DataService } from '../../services/data.service';
import { FirestoreService } from '../../services/firestore.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-registro-horarios',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent,
    CalendarComponent,
    CheckboxComponent,
    MatStepperModule,
    SpinnerComponent
  ],
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss'
})
export class RegistroHorariosComponent implements OnInit {
  isLinear = false;

  isSmallScreen = false;

  semanasList: { id: string, nombre: string }[] = []; // 4 semanas (1 actual y 3 posteriores)
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  tipoClaseList: { id: string, nombre: string }[] = this.listService.tipoClase; // tipos de clase

  horariosList: string[] = [];

  selectedSemana: string = ''; // semana seleccionada
  selectedtDia: string = ''; // dia seleccionado
  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean, type: string }
      }
    }
  } = {};

  terminosCondiciones: string = '';

  semanaCalendar: string = '';
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = []; // items para el calendario

  cursosSelect: { name: string, select: boolean }[] = [];
  loadCursos: boolean = true;

  constructor(
    public listService: ListService,
    private dataService: DataService,
    private fs: FirestoreService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    if (this.dataService.datosHorarios.length == 0) {
      this.fs.getSubColeccionData('data_profesor/horarios')
        .then(data => {
          this.dataService.setDatosHorarios(data.data);

          const correo = localStorage.getItem('correo');
          this.fs.getSubColeccionData(`reservas_clase/${correo}`)
            .then((reserva) => {

              const semana = this.listService.intervaloSemana();
              this.semanasList = semana;
              this.selectedSemana = semana[0].id;
              this.semanaCalendar = semana[0].id;

              const diaSemana = this.listService.diasSemana;
              this.selectedtDia = diaSemana[0].id;

              // ---------------------------------------------------------------
              const searchSemanaInicial = reserva[this.semanaCalendar.replaceAll('/', '|')];
              
              const newSlots: any[] = [];
              if (searchSemanaInicial == undefined) {
                for (let i = 0; i > data.data; i++) {
                  newSlots.push([false, false, false, false, false, false, false]);
                }
              } else {
                for (let j = 0; j < data.data.length; j++) {
                  newSlots[j] = [];
                  for (let i = 0; i < this.diasList.length; i++) {
                    const searchHorario = searchSemanaInicial.filter((item: string) => item.includes(`${this.diasList[i].id}|${data.data[j]}`))
                    if (searchHorario.length == 0) newSlots[j][i] = false;
                    else newSlots[j][i] = true;
                  }
                }
              }
              this.selectedSlots = newSlots;
              // ---------------------------------------------------------------
              let newData: any = {};
              for (let i = 0; i < semana.length; i++) { // 12|05|2025 - 18|05|2025

                const searchSemana = reserva[semana[i].id.replaceAll('/', '|')];
                newData[semana[i].id] = {};

                for (let j = 0; j < diaSemana.length; j++) { // LUNES

                  newData[semana[i].id][diaSemana[j].id] = {};

                  for (let k = 0; k < data.data.length; k++) { // 8:00am - 9:25am
                    
                    const horario = data.data[k];

                    if (searchSemana == undefined) {
                      newData[semana[i].id][diaSemana[j].id][horario] = { checked: false, type: '' };
                    } else {
                      const searchHorario = searchSemana.filter((item: string) => item.includes(`${this.diasList[i].id}|${horario}`));

                      if (searchHorario.length == 0) { 
                        newData[semana[i].id][diaSemana[j].id][horario] = { checked: false, type: '' };
                      } else {
                        const tipo = searchHorario[0].split('|');
                        newData[semana[i].id][diaSemana[j].id][horario] = { checked: true, type: tipo[2] };
                      }
                    }
                  }
                }
              }
              this.data = newData;
              // ---------------------------------------------------------------

              this.horariosList = data.data;
            })
            .catch((error) => { console.log('error', error); });
        })
        .catch((error) => {
          console.log('error', error);
        });
    }

    if (this.dataService.datosCursos.length == 0) {
      this.fs.getSubColeccionData('data_profesor/cursos')
        .then((data) => {
          this.dataService.setDatosCursos(data.data);

          const correo = localStorage.getItem('correo');
          this.fs.getSubColeccionData(`cursos_profe/${correo}`)
            .then((curso) => {
              this.dataService.setDatosSelectCursosProf(curso.data);
              this.cursosSelect = data.data.map((item: string) => ({ name: item, select: curso.data.includes(item) }));
              this.loadCursos = false;
            })
            .catch((error) => { console.log('error', error); });
        })
        .catch((error) => { console.log('error', error); });
    } else {
      this.cursosSelect = this.dataService.datosCursos.map((item: string) => ({ name: item, select: this.dataService.datosSelectCursosProf.includes(item) }));
      this.loadCursos = false;
    }

    if (this.dataService.termCondProf.length == 0) {
      this.fs.getSubColeccionData('data_profesor/terminos_condiciones')
        .then(data => {
          this.dataService.setTermCondProf(data.data);
          this.terminosCondiciones = data.data;
        })
        .catch((error) => { console.log('error', error); });
    } else this.terminosCondiciones = this.dataService.termCondProf;
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

  guardarCursos() {
    const correo = localStorage.getItem('correo');
    const cursosSeleccionados = this.cursosSelect.filter((item) => item.select == true).map((item) => item.name);
    this.fs.updateSubColeccionData('cursos_profe', correo ? correo : '', cursosSeleccionados, '');
  }

  guardarHorarios() {
    const dataSemana: any = {};
    for (let semana = 0; semana < this.semanasList.length; semana++) {
      const dataHorario: any[] = [];
      for (let dia = 0; dia < this.diasList.length; dia++) {
        for (let horario = 0; horario < this.horariosList.length; horario++) {
          const valueHorario = this.data[this.semanasList[semana].id][this.diasList[dia].id][this.horariosList[horario]];
          if (valueHorario.checked) {
            dataHorario.push(`${this.diasList[dia].id}|${this.horariosList[horario]}|${valueHorario.type}`);
          }
        }
      }
      dataSemana[this.semanasList[semana].id] = dataHorario;
    }

    for (const clave in dataSemana) {
      const valor = dataSemana[clave];
      const correo = localStorage.getItem('correo');
      const fecha = clave.replaceAll("/", "|");
      this.fs.updateSubColeccionData('reservas_clase', correo ? correo : '', { [fecha]: valor }, 'individual');
    }
  }

}