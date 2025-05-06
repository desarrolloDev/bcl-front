import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../../ui/tabs/tabs.component';
import { TabComponent } from '../../ui/tab/tab.component';
import { CreateDataComponent } from './create-data/create-data.component';
import { FirestoreService } from '../../services/firestore.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin-web',
  standalone: true,
  imports: [
    TabsComponent,
    TabComponent,
    CreateDataComponent
  ],
  templateUrl: './admin-web.component.html',
  styleUrl: './admin-web.component.scss'
})
export class AdminWebComponent implements OnInit {
  dataAlumno: any[] = [];
  dataProfesor: any[] = [];
  coleccion: string = '';

  constructor(
    private fs: FirestoreService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.dataAlumno = [
      {
        data: ['Math IB SL'],
        id: "curso",
        name: "Selecciona tu curso",
        type: 'arrayString'
      },
      {
        id: "paquete_clase",
        name: "Selecciona paquete de clases",
        type: 'personalizado'
      },
    ];
    // if (this.dataService.datosListasAlumno.length == 0) {
    //   this.fs.obtenerDocumentos('data_alumnos')
    //   .then(data => {
    //     console.log('data', data);
    //     this.dataService.setDatosListasAlumno(data);
    //     this.dataAlumno = data;
    //   })
    //   .catch((error) => {
    //     console.log('error', error);
    //   });
    // }

    // if (this.dataService.datosListasProfesor.length == 0) {
    //   this.fs.obtenerDocumentos('data_profesor')
    //   .then(data => {
    //     console.log('data', data);
    //     this.dataService.setDatosListasProfesor(data);
    //     this.dataProfesor = data;
    //   })
    //   .catch((error) => {
    //     console.log('error', error);
    //   });
    // }
  }
}
