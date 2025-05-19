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

  intervaloSemana() {
    const startDate = new Date();
    const weeks = [];
    const day = startDate.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const currentMonday = new Date(startDate);
    currentMonday.setDate(startDate.getDate() + diffToMonday);

    for (let i = 0; i < 4; i++) {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() + i * 7);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const format = (date: any) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      };

      const semana = `${format(monday)} - ${format(sunday)}`;
      weeks.push({ id: semana, nombre: semana });
    }

    return weeks;
  }

  tipoClase: any[] = [
    { id: 'Individual', nombre: 'Individual' },
    { id: 'Grupo hasta 5', nombre: 'Grupo hasta 5' },
    { id: 'Clase gratuita individual', nombre: 'Clase gratuita individual' },
    { id: 'Clase gratuita grupal hasta 5 personas', nombre: 'Clase gratuita grupal hasta 5 personas' },
  ]

  modulosDashboard(rol: string): any {
    const newModulos = [];

    if (rol == 'ADMIN') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Horario de Profesores', redirect: '/horarios_profesor' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Crear Profesor/Admin', redirect: '/createProfesorAdmin' });
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Confirmación de Reservas', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_reporte.PNG', title: 'Reportes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_gestion.PNG', title: 'Gestión de web', redirect: '/gestion_web' });
    } else if (rol == 'PROFESOR') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Registro de Horarios', redirect: '/registro_horarios' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Clases a dictar', redirect: '' });
    } else if (rol == 'ESTUDIANTE') {
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Historial de paquetes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Reserva de clases', redirect: '' });
    }
    return newModulos;
  }
}
