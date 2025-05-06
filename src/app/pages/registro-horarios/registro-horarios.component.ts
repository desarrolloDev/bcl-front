import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { ListService } from '../../services/list.service';
import { DataService } from '../../services/data.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-registro-horarios',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss'
})
export class RegistroHorariosComponent implements OnInit {
  horariosList: { id: string, nombre: string }[] = [];

  semana: string = '';
  dia: string = '';
  horariosSelect: { name: string, select: boolean, tipo: string }[] = [];
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
        console.log('data', data);
        this.dataService.setDatosHorarios(data);
      })
      .catch((error) => {
        console.log('error', error);
      });
    } else {

    }

    if (this.dataService.datosCursos.length == 0) {
      this.fs.getSubColeccionData('data_profesor/cursos')
      .then(data => {
        console.log('data', data);
        this.dataService.setDatosCursos(data);
      })
      .catch((error) => {
        console.log('error', error);
      });
    } else {
      
    }
  }
}
