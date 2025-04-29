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
    // this.dataAlumno = [
    //   {
    //     data: ['6th grade'],
    //     id: "ciclo",
    //     name: "Selecciona ciclo"
    //   },
    //   {
    //     data: 'kkkkkkkkkkkkk',
    //     id: 'confirmacion_reserva',
    //     name: 'Texto de confirmación de reserva'
    //   },
    //   {
    //     data: ['Math IB SL'],
    //     id: "curso",
    //     name: "Selecciona tu curso"
    //   },
    //   {
    //     data: ['kokoko'],
    //     id: "grado",
    //     name: "Selecciona grado"
    //   },
    //   {
    //     data: [ { grupal: true, individual: false, name: "4 clases" } ],
    //     id: "paquete_clase",
    //     name: "Selecciona paquete de clases"
    //   },
    //   {
    //     data: ['Leonardo'],
    //     id: "profesor_preferencia",
    //     name: "Selecciona el profesor de tu preferencia"
    //   },
    //   {
    //     data: "lljljjjjjj",
    //     id: "terminos_condiciones",
    //     name: "Texto de Términos y Condiciones"
    //   },
    //   {
    //     data: ['knkn'],
    //     id: "tipo_clase",
    //     name: "Selecciona tipo de clase"
    //   }
    // ];
    // this.dataProfesor = [
    //   {
    //     data: ['Math IB SL'],
    //     id: "cursos",
    //     name: "Cursos"
    //   },
    //   {
    //     data: ['8:00am - 9:25am'],
    //     id: "horarios",
    //     name: "Horarios"
    //   },
    //   {
    //     data: 'kkkkkkkkkkkkkkk',
    //     id: 'recordatorio',
    //     name: 'Texto de Recordatorio'
    //   },
    //   {
    //     data: 'mllllllllllllllllll',
    //     id: 'terminos_condiciones',
    //     name: 'Texto de Términos y Condiciones'
    //   }
    // ];
    if (this.dataService.datosListasAlumno.length == 0) {
      this.fs.obtenerDocumentos('data_alumnos')
      .then(data => {
        console.log('data', data);
        this.dataService.setDatosListasAlumno(data);
        this.dataAlumno = data;
      })
      .catch((error) => {
        console.log('error', error);
      });
    }

    if (this.dataService.datosListasProfesor.length == 0) {
      this.fs.obtenerDocumentos('data_profesor')
      .then(data => {
        console.log('data', data);
        this.dataService.setDatosListasProfesor(data);
        this.dataProfesor = data;
      })
      .catch((error) => {
        console.log('error', error);
      });
    }
  }
}
