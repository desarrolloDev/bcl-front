import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { CalendarComponent } from '../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { ListService } from '../../services/list.service';
import { DataService } from '../../services/data.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-registro-horarios',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent,
    CalendarComponent,
    CheckboxComponent
  ],
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss'
})
export class RegistroHorariosComponent implements OnInit {
  semanasList: { id: string, nombre: string }[] = []; // 4 semanas (1 actual y 3 posteriores)
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  tipoClaseList: { id: string, nombre: string }[] = this.listService.tipoClase; // tipos de clase

  horariosList: string[] = [];

  selectedSemana: string = ''; // semana seleccionada
  selectedtDia: string = ''; // dia seleccionado
  data: { [semana: string] : {
    [dia: string]: {
      [time: string]: { checked: boolean, type: string }
    }
  }} = {};

  terminosCondiciones: string = '';

  selectedSlots: boolean[][] = []; // items para el calendario

  cursosSelect: { name: string, select: boolean }[] = [];

  constructor(
    public listService: ListService,
    private dataService: DataService,
    private fs: FirestoreService,
  ) {}

  ngOnInit() {
    if (this.dataService.datosHorarios.length == 0) {
      this.fs.getSubColeccionData('data_profesor/horarios')
      .then(data => {
        this.dataService.setDatosHorarios(data.data);

        const semana = this.listService.intervaloSemana();
        this.semanasList = semana;
        this.selectedSemana = semana[0].id;

        const diaSemana = this.listService.diasSemana;
        this.selectedtDia = diaSemana[0].id;

        const newSlots = [];
        for (let i = 0; i > data.data; i++) {
          newSlots.push([false, false, false, false, false, false, false]);
        }
        this.selectedSlots = newSlots;

        let newData: any = {};
        for (let i = 0; i < semana.length; i++) {
          newData[semana[i].id] = {};
          for (let j = 0; j < diaSemana.length; j++) {
            newData[semana[i].id][diaSemana[j].id] = {};
            for (let k = 0; k < data.data.length; k++) {
              newData[semana[i].id][diaSemana[j].id][data.data[k]] = { checked: false, type: this.listService.tipoClase[0].id };
            }
          }
        }
        console.log('newData', newData);
        this.data = newData;

        this.horariosList = data.data;
      })
      .catch((error) => {
        console.log('error', error);
      });
    }

    if (this.dataService.datosCursos.length == 0) {
      this.fs.getSubColeccionData('data_profesor/cursos')
      .then(data => {
        this.dataService.setDatosCursos(data.data);
        this.cursosSelect = data.data.map((item: string) => { return { name: item, select: false } });
      })
      .catch((error) => { console.log('error', error); });
    } else this.cursosSelect = this.dataService.datosCursos.map((item: string) => { return { name: item, select: false} });

    if (this.dataService.termCondProf.length == 0) {
      this.fs.getSubColeccionData('data_profesor/terminos_condiciones')
      .then(data => {
        this.dataService.setTermCondProf(data.data);
        this.terminosCondiciones = data.data;
      })
      .catch((error) => { console.log('error', error); });
    } else this.terminosCondiciones = this.dataService.termCondProf;
  }

  inicializarHorarios(): void {
    console.log('this.horariosList', this.horariosList);
  }

  actualizarHorarios(): void {
    const newData: any[] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        newData[j][i] = this.data[this.selectedSemana][this.diasList[i].id][this.horariosList[j]].checked
      }
    }
    this.selectedSlots = newData;
  }

  guardarSeleccion() {
    const correo = localStorage.getItem('correo');
    console.log('data', this.data);
  }
}