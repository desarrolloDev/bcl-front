import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { CalendarComponent } from '../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { ListService } from '../../services/list.service';
import { DataService } from '../../services/data.service';
import { AwsService } from '../../services/aws.service';
import { GetDataService } from '../../services/getData.service';
import { ModalService } from '../../ui/modal/modal.service';

@Component({
  selector: 'app-registro-horarios',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
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
        [time: string]: { checked: boolean, isDisabled: boolean, type: string }
      }
    }
  } = {};

  terminosCondiciones: string = '';

  semanaCalendar: string = '';
  semanaOffset: number = 0;
  selectedSlots: boolean[][] = []; // items para el calendario

  cursosSelect: { name: string, select: boolean }[] = [];
  loadCursos: boolean = true;

  loadCalendar: boolean = true;

  loadChange: boolean = false;

  constructor(
    public listService: ListService,
    private dataService: DataService,
    private breakpointObserver: BreakpointObserver,
    private awsService: AwsService,
    private getDataService: GetDataService,
    private modalService: ModalService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    
    const semana = this.listService.intervaloSemanaMes();
    this.semanasList = semana;
    this.selectedSemana = semana[0].id;
    this.semanaCalendar = semana[0].id;

    const diaSemana = this.listService.diasSemana;
    this.selectedtDia = diaSemana[0].id;

    this.horariosList = await this.getDataService.horariosList();

    this.terminosCondiciones = await this.getDataService.terminos_condiciones_prof();

    let horarioReserva = await this.getHorariosProfesor(semana);

    const semana_actual = this.listService.obtenerRangoActual();
    const semana_posterior = this.listService.obtenerSemanaSiguiente(semana_actual);
    const ahora = new Date();
    const diasSemanaNombre = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diaActualNombre = diasSemanaNombre[ahora.getDay()];
    const ahoraHora = ahora.getHours();
    const horaLimite = 9; // 9:00am

    // Marcar en gris y blanco todos los slots del calendario (Se toma en cuenta la semana actual al ser la semana 0)
    const newSlots: any[] = [];

    const buscarReservaSemana = horarioReserva.filter((item: any) => {
      if (!item?.semana_profesor) return false;
      return item.semana_profesor.includes(semana[0].id);
    });

    for (let j = 0; j < this.horariosList.length; j++) {
      newSlots[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {

        if (buscarReservaSemana.length > 0 && Object.keys(buscarReservaSemana[0].horarios).length > 0) {
          const searchHorario = buscarReservaSemana[0].horarios[`${this.diasList[i].id}|${this.horariosList[j]}`] ?? null;

          if (searchHorario?.tipo) newSlots[j][i] = true;
          else newSlots[j][i] = false;

        } else newSlots[j][i] = false;
      }
    }

    this.selectedSlots = newSlots;

    // ------------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------------

    // Reiniciar data de los checkboxes para el calendario
    let newData: any = {};
    for (let i = 0; i < semana.length; i++) { // 12|05|2025 - 18|05|2025
      newData[semana[i].id] = {};

      const buscarSemana = horarioReserva.filter((item: any) => {
        if (!item?.semana_profesor) return false;
        return item.semana_profesor.includes(semana[i].id);
      });

      for (let j = 0; j < diaSemana.length; j++) { // LUNES
        newData[semana[i].id][diaSemana[j].id] = {};

        for (let k = 0; k < this.horariosList.length; k++) { // 8:00am - 9:25am
          const horario = this.horariosList[k];

          // Validar si se puede seleccionar el horario ---------------------------------------
          let puedeReservar = true;

          if (semana[i].id === semana_actual) {
            puedeReservar = false;
          } else if (semana[i].id === semana_posterior) {
            
            if (diaActualNombre == 'LUNES') {
              puedeReservar = ahoraHora < horaLimite;
            } else puedeReservar = false;
          }

          // ----------------------------------------------------------------------------------

          let checked = false;
          let tipo = 'Individual';

          if (buscarSemana.length > 0 && Object.keys(buscarSemana[0].horarios).length > 0) {
            const searchHorario = buscarSemana[0].horarios[`${diaSemana[j].id}|${horario}`] ?? null;
            
            if (searchHorario !== null) {
              checked = true;
              tipo = searchHorario.tipo;

              if (searchHorario.alumnos.length > 0) { // Si hay un alumno asignado, no se puede eliminar el horario
                puedeReservar = false;
              }
            }
          }

          newData[semana[i].id][diaSemana[j].id][horario] = {
            checked: checked,
            isDisabled: !puedeReservar ? true : false,
            type: tipo
          };
        }
      }
    }

    this.data = newData;
    this.loadCalendar = false;

    // ------------------------------------------------------------------------------------------------------------
    await this.getCursosProfesor();
    // ------------------------------------------------------------------------------------------------------------
  }

  async getHorariosProfesor(semanas: any)  {
    const semanaString = semanas.map((item: any) => item.id).join(',');

    let dataHorarios: any[] = [];

    const correo = localStorage.getItem('correo');
    await this.awsService.get(`items?tipo=horario_profesor&profesor=${correo}&semanas=${semanaString}`)
      .then((response: any) => {
        dataHorarios = JSON.parse(response.body);
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });

    return dataHorarios;
  }

  async getCursosProfesor() {
    const data_cursos_prof = await this.getDataService.data_cursos_prof();

    const correo = localStorage.getItem('correo');
    this.awsService.get(`items?tipo=cursos_profesor&profesor=${correo}`)
      .then((response: any) => {
        const responseData = JSON.parse(response.body);
        let newCursos = responseData.length !== undefined ? responseData.map((item: any) => item.curso) : [];
        this.dataService.setDatosSelectCursosProf(newCursos);

        this.cursosSelect = data_cursos_prof.map((item: string) => ({ name: item, select: newCursos.includes(item) }));
        this.loadCursos = false;
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
        this.cursosSelect = data_cursos_prof.map((item: string) => ({ name: item, select: false }));
        this.loadCursos = false;
      });
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

  async guardarCursos() {
    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¿Está seguro de guardar los cursos?',
      mensaje: '',
      type: '',
      load: this.loadChange,
      msgBtnAceptar: 'Sí, Guardar',
      msgBtCerrar: 'Cancelar'
    }).toPromise();

    if (confirmed) {
      const loadingRef = this.modalService.openLoadingDialog('Guardando...');

      this.loadChange = true;

      const cursosSeleccionados = this.cursosSelect.filter((item) => item.select == true).map((item) => item.name);

      const body = {
        tipo: 'guardarCursos',
        profesor: localStorage.getItem('correo'),
        cursos: cursosSeleccionados
      };

      this.awsService.post('items', body)
        .then((response) => {
          loadingRef.close();
          this.modalService.openResultDialog(true, 'Tu data fue guardada');
        })
        .catch((error) => {
          console.error('Error al guardar cursos', error);
          loadingRef.close();
          this.modalService.openResultDialog(false, 'Error al guardar cursos, intenta nuevamente más tarde.');
        });
    }
  }

  async guardarHorarios() {
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

      this.loadChange = true;

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

      const body = {
        tipo: 'guardarHorarios',
        profesor: localStorage.getItem('correo'),
        horarios: dataSemana
      };

      this.awsService.post('items', body)
        .then((response) => {
          loadingRef.close();
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