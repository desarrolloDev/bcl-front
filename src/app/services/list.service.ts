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

  obtenerRangoActual() {
    const fecha = new Date();

    let diaSemana = fecha.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana;

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - (diaSemana - 1));

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const formato = (f: Date) => f.toISOString().split("T")[0].split("-").reverse().join("/");

    return `${formato(lunes)} - ${formato(domingo)}`;
  }

  obtenerSemanaSiguiente(rango: string) {
    const [inicioStr] = rango.split(' - ');
    const [dia, mes, anio] = inicioStr.split('/').map(Number); // Convertimos a números

    // Crear fecha en formato local: año, mes (0-based), día
    const fechaInicio = new Date(anio, mes - 1, dia);

    // Sumar 7 días al lunes actual para obtener el siguiente lunes
    const siguienteLunes = new Date(fechaInicio);
    siguienteLunes.setDate(fechaInicio.getDate() + 7);

    // Domingo = lunes + 6 días
    const siguienteDomingo = new Date(siguienteLunes);
    siguienteDomingo.setDate(siguienteLunes.getDate() + 6);

    const formatear = (fecha: Date) => {
      const d = String(fecha.getDate()).padStart(2, '0');
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const y = fecha.getFullYear();
      return `${d}/${m}/${y}`;
    };

    return `${formatear(siguienteLunes)} - ${formatear(siguienteDomingo)}`;
  }

  obtenerDiaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

    return dias[diaSemana]; 
  }

  obtenerCondicional() {
    return [
      ['NO', 'CONSULTAR', 'SI', 'SI', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'CONSULTAR', 'SI', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'CONSULTAR', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'CONSULTAR', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'CONSULTAR', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'CONSULTAR'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
    ];
  }

  diasIndice(dia: string)  {
    if (dia == 'LUNES') return 0;
    else if (dia == 'MARTES') return 1;
    else if (dia == 'MIERCOLES') return 2;
    else if (dia == 'JUEVES') return 3;
    else if (dia == 'VIERNES') return 4;
    else if (dia == 'SABADO') return 5;
    else if (dia == 'DOMINGO') return 6;
    else return 0;
  };

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
    { id: 'Grupo hasta 5', nombre: 'Grupal hasta 5' },
    { id: 'Promo Primera Clase', nombre: 'Promo Primera Clase' },
    { id: 'Clase Individual Gratuita', nombre: 'Clase Individual Gratuita' },
    { id: 'Clase Grupal Gratuita', nombre: 'Clase Grupal Gratuita' },
  ]

  modulosDashboard(rol: string): any {
    const newModulos = [];

    if (rol == 'ADMIN') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Horario de Profesores', redirect: '/horarios_profesor' });
      newModulos.push({ image: '../../../../assets/images/modulo_crear_usuario.png', title: 'Crear Usuario', redirect: '/createProfesorAdmin' });
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Confirmación de Reservas', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_reporte.PNG', title: 'Reportes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_gestion.PNG', title: 'Gestión de web', redirect: '/gestion_web' });
    } else if (rol == 'PROFESOR') {
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Registro de Horarios', redirect: '/registro_horarios' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Clases a dictar', redirect: '' });
    } else if (rol == 'ESTUDIANTE') {
      newModulos.push({ image: '../../../../assets/images/modulo_confirmacion.PNG', title: 'Historial de paquetes', redirect: '' });
      newModulos.push({ image: '../../../../assets/images/modulo_horarios.PNG', title: 'Reserva de clases', redirect: '/reservar_clases' });
    }
    return newModulos;
  }
}
