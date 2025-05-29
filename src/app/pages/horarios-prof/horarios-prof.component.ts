import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../../ui/select/select.component';
import { CalendarComponent } from '../../ui/calendar/calendar.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { ListService } from '../../services/list.service';
import { DataService } from '../../services/data.service';
import { FirestoreService } from '../../services/firestore.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-horarios-prof',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    CalendarComponent,
    CheckboxComponent,
  ],
  templateUrl: './horarios-prof.component.html',
  styleUrl: './horarios-prof.component.scss'
})
export class HorariosProfComponent implements OnInit {
  isSmallScreen = false;
  
  ProfesoresList: { id: string, nombre: string }[] = [];
  selectedProf: string = '';

  semanasList: { id: string, nombre: string }[] = this.listService.intervaloSemana();
  diasList: { id: string, nombre: string }[] = this.listService.diasSemana;
  selectedSemana: string = '';

  selectedSlots: boolean[][] = [];

  cursosSelect: { name: string, select: boolean }[] = [];

  horariosList: string[] = [];

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
    this.dataProfesores();
    this.dataHorarios();
    this.dataCursos();
  }

  dataHorarios() {
    if (this.dataService.datosHorarios.length == 0) {
      this.fs.getSubColeccionData('data_profesor/horarios')
        .then(data => {
          this.dataService.setDatosHorarios(data.data);
          this.horariosList = data.data;

          const newSlots: any[] = [];
          for (let i = 0; i > data.data; i++) {
            newSlots.push([false, false, false, false, false, false, false]);
          }
          this.selectedSlots = newSlots;
        })
        .catch((error) => {
          console.log('error', error);
        });
    } else {
      this.horariosList = this.dataService.datosHorarios;

      const newSlots: any[] = [];
      for (let i = 0; i > this.dataService.datosHorarios; i++) {
        newSlots.push([false, false, false, false, false, false, false]);
      }
      this.selectedSlots = newSlots;
    }
  }

  dataProfesores() {
    if (this.dataService.listaProf.length == 0) {
      this.fs.getSubColeccionData('data_alumnos/profesor_preferencia')
        .then(data => {
          this.dataService.setListaProf(data.data);
          this.ProfesoresList = data.data;
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

  changeProf(): void {
    const newSlots: any[] = [];
    for (let i = 0; i > this.dataService.datosHorarios; i++) {
      newSlots.push([false, false, false, false, false, false, false]);
    }
    this.selectedSlots = newSlots;

    this.fs.getSubColeccionData(`user/${this.selectedProf}`)
      .then((curso) => {
        let newCursos = curso.cursos !== undefined ? curso.cursos : [];

        this.dataService.setDatosSelectCursosProf(newCursos);
        this.cursosSelect = this.dataService.datosCursosProf.map((item: string) => ({ name: item, select: newCursos.includes(item) }));
      })
      .catch((error) => { console.log('error', error); });
  }

  async changeSemana(): Promise<void> {
    const data = await this.fs.getAllReservasSemana(this.selectedProf, [{ id: this.selectedSemana }]);
    console.log('data', data);

    // ---------------------------------------------------------------
    const searchSemanaInicial = data[this.selectedSemana];
              
    const newSlots: any[] = [];
    for (let j = 0; j < this.dataService.datosHorarios.length; j++) {
      newSlots[j] = [];
      for (let i = 0; i < this.diasList.length; i++) {
        const searchHorario = searchSemanaInicial.filter((item: string) => item.includes(`${this.diasList[i].id}|${this.dataService.datosHorarios[j]}`))
        if (searchHorario.length == 0) newSlots[j][i] = false;
        else newSlots[j][i] = true;
      }
    }
    this.selectedSlots = newSlots;
    // ---------------------------------------------------------------
  }
}
