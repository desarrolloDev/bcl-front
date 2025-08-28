import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SelectComponent } from '../../../ui/select/select.component';
import { CalendarStatusComponent } from '../../../ui/calendar-status/calendar-status.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { ListService } from '../../../services/list.service';
import { DataService } from '../../../services/data.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AwsService } from '../../../services/aws.service';
import { GetDataService } from '../../../services/getData.service';
import { ButtonBackComponent } from '../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-horarios-prof',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    CalendarStatusComponent,
    CheckboxComponent,
    ButtonBackComponent
  ],
  templateUrl: './horarios-prof.component.html',
  styleUrl: './horarios-prof.component.scss'
})
export class HorariosProfComponent implements OnInit {
  isSmallScreen = false;
  
  semanasList: { id: string, nombre: string }[] = this.listService.intervaloSemana(); // 4 semanas (1 actual y 3 posteriores)
  selectedSemana: string = '';

  ProfesoresList: { id: string, nombre: string }[] = [];
  selectedProf: string = '';

  diasList: { id: string, nombre: string }[] = this.listService.diasSemana; // dias de la semana
  horariosList: string[] = []; // horarios de clase
  

  selectedSlots: [][] = [];

  cursosSelect: { name: string, select: boolean }[] = [];

  data: {
    [semana: string]: {
      [dia: string]: {
        [time: string]: { checked: boolean; text: string}
      }
    }
  } = {};

  constructor(
    public listService: ListService,
    private dataService: DataService,
    private fs: FirestoreService,
    private breakpointObserver: BreakpointObserver,
    private awsService: AwsService,
    private getDataService: GetDataService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    this.horariosList = await this.getDataService.horariosList();

    this.dataProfesores();
    this.dataCursos();

    this.semanaBloqueado(); 
  }

  dataProfesores() {
    if (this.dataService.listaProf.length == 0) {
      this.fs.getSubColeccionData('data_alumnos/profesor_preferencia')
        .then(data => {
          this.dataService.setListaProf(data.data);
          this.ProfesoresList = data.data;
          this.ProfesoresList.unshift({ id: '', nombre: '' });
        })
        .catch((error) => { console.log('error', error); });
    } else this.ProfesoresList = this.dataService.listaProf;
  }

  dataCursos() {
    if (this.dataService.datosCursosProf.length == 0) {
      this.fs.getSubColeccionData('data_profesor/cursos')
        .then((data) => {
          this.dataService.setDatosCursos(data.data);
          this.cursosSelect = data.data.map((item: string) => ({ name: item, select: false }));
        })
        .catch((error) => { console.log('error', error); });
    } else {
      this.cursosSelect = this.dataService.datosCursosProf.map((item: string) => ({ name: item, select: false }));
    }
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

  async changeProf(): Promise<void> {
    await this.getCursosProfesor();

    await this.dataHorarios();
  }

  async dataHorarios() {
    const semanaString = this.semanasList.map((item: any) => item.id).join(',');

    let dataHorariosProfesor: any[] = [];
    await this.awsService.get(`items?tipo=horario_profesor&profesor=${localStorage.getItem('correo')}&semanas=${semanaString}`)
      .then((response: any) => {
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

        for (let k = 0; k < this.horariosList.length; k++) { // 8:00am - 9:25am
          const horario = this.horariosList[k];

          const itemHorario = buscarSemana.length > 0 ? buscarSemana[0].horarios[`${dia}|${horario}`] : {};
          console.log('itemHorario', dia, horario, itemHorario);

          if (itemHorario == undefined || Object.keys(itemHorario).length === 0) {
            newData[semana][dia][horario] = { checked: false, text: '' };
  
          } else {
            const alumnosReserva =  itemHorario.alumnos ?? [];
            if (alumnosReserva.length > 0) {
              newData[semana][dia][horario] = { checked: true, text: alumnosReserva.map((al: string) => `${al.split('|')[0]}|${al.split('|')[1]}`).join(', ') };

            } else {
              newData[semana][dia][horario] = { checked: true, text: '' };
            }
          }

          // ---------------------------------------------------------------------------------          
        }
      }
    }

    console.log('newData', newData);
    this.data = newData;
  }

  actualizarHorarios(): void {
    const newData: any[] = [];
    for (let j = 0; j < this.horariosList.length; j++) {
      newData[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        newData[j][i] = this.data[this.selectedSemana][this.diasList[i].id][this.horariosList[j]]
      }
    }
    this.selectedSlots = newData;
  }

  async changeSemana(): Promise<void> {
    // LISTA DE HORARIOS PARA EL CALENDARIO --------------------------------------------------------------------
    this.actualizarHorarios();
  }

  async getCursosProfesor() {
    this.awsService.get(`items?tipo=cursos_profesor&profesor=${this.selectedProf}`)
      .then((response: any) => {
        const responseData = JSON.parse(response.body);
        let newCursos = responseData.length !== undefined ? responseData.map((item: any) => item.curso) : [];
        this.dataService.setDatosSelectCursosProf(newCursos);

        this.cursosSelect = this.cursosSelect.map((item: any) => ({ name: item.name, select: newCursos.includes(item.name) }));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
        this.cursosSelect = this.cursosSelect.map((item: any) => ({ name: item.name, select: false }));
      });
  }
}
