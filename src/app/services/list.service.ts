import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  intitucionesPeru = [];

  constructor() { }

  tiposDocumentos: any[] = [
    { id: 'DNI', nombre: 'DNI' },
    { id: 'CE', nombre: 'Carnet de extranjería' },
  ];

  tipoRol: any[] = [
    { id: 'PROFESOR', nombre: 'Profesor' },
    { id: 'ADMIN', nombre: 'Admin' },
    { id: 'ESTUDIANTE', nombre: 'Estudiante' },
  ];

  diasSemana: any[] = [
    { id: 'LUNES', nombre: 'Lunes' },
    { id: 'MARTES', nombre: 'Martes' },
    { id: 'MIERCOLES', nombre: 'Miércoles' },
    { id: 'JUEVES', nombre: 'Jueves' },
    { id: 'VIERNES', nombre: 'Viernes' },
    { id: 'SABADO', nombre: 'Sábado' },
    { id: 'DOMINGO', nombre: 'Domingo' },
  ];

  modulosDashboard(rol: string): any {
    const newModulos = [];

    if (rol == 'ADMIN') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Horario de Profesores', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Crear Profesor/Admin', redirect: '/createProfesorAdmin' });
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Confirmación de Reservas', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_reporte.PNG', title: 'Reportes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_gestion.PNG', title: 'Gestión de web', redirect: '/gestion_web' });
    } else if (rol == 'PROFESOR') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Registro de Horarios', redirect: '/registro_horarios' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Clases a dictar', redirect: '' });
    }  else if (rol == 'ESTUDIANTE') {
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Historial de paquetes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Reserva de clases', redirect: '' });
    }
    return newModulos;
  }
}
