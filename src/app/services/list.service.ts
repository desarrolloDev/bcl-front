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

  obtenerRangoActual(): string {
    const fecha = new Date();

    let diaSemana = fecha.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana;

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - (diaSemana - 1));

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const formato = (f: Date): string => {
      const dia = String(f.getDate()).padStart(2, "0");
      const mes = String(f.getMonth() + 1).padStart(2, "0");
      const anio = f.getFullYear();
      return `${dia}/${mes}/${anio}`;
    };

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

  diasSemanaString() {
    return ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  }

  obtenerDiaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

    return dias[diaSemana]; 
  }

  obtenerCondicionalProfesor() {
    return [
      ['CONSULTAR', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
    ];
  }

  obtenerCondicional() {
    // return [
    //   ['NO', 'CONSULTAR', 'SI', 'SI', 'SI', 'SI', 'SI'],
    //   ['NO', 'NO', 'CONSULTAR', 'SI', 'SI', 'SI', 'SI'],
    //   ['NO', 'NO', 'NO', 'CONSULTAR', 'SI', 'SI', 'SI'],
    //   ['NO', 'NO', 'NO', 'NO', 'CONSULTAR', 'SI', 'SI'],
    //   ['NO', 'NO', 'NO', 'NO', 'NO', 'CONSULTAR', 'SI'],
    //   ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'CONSULTAR'],
    //   ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
    // ];
    return [
      ['NO', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'SI', 'SI', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'SI', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'SI', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'SI', 'SI'],
      ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'SI'],
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

  intervaloSemanaMes() {
    const today = new Date();

    const startDate = new Date();
    // startDate.setMonth(today.getMonth() - 1); // Rango de fechas: 1 mes antes

    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 1); // Rango de fechas: 1 mes después

    // Asegurar que empiece desde el lunes más cercano anterior o actual
    const startDay = startDate.getDay();
    const diffToMonday = (startDay === 0 ? -6 : 1) - startDay;
    const firstMonday = new Date(startDate);
    firstMonday.setDate(startDate.getDate() + diffToMonday);

    const weeks = [];

    for (
      let currentMonday = new Date(firstMonday);
      currentMonday <= endDate;
      currentMonday.setDate(currentMonday.getDate() + 7)
    ) {
      const monday = new Date(currentMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const format = (date: Date) => {
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
    { id: 'Grupal hasta 5', nombre: 'Grupal hasta 5' },
    { id: 'Promo Primera Clase', nombre: 'Promo Primera Clase' },
    { id: 'Clase Individual Gratuita', nombre: 'Clase Individual Gratuita' },
    { id: 'Clase Grupal Gratuita', nombre: 'Clase Grupal Gratuita' },
  ]

  modulosDashboard(rol: string): any {
    const newModulos = [];    

    // const newModulos = [
    //   { image: 'assets/Confirmación de reservas.jpg', title: 'Confirmación de Reservas', redirect: '/confirmacion_reservas' },
    //   { image: 'assets/Horario de profesores.jpg', title: 'Horario de Profesores', redirect: '/horarios_profesor' },
    //   { image: 'assets/Crear usuario.jpg', title: 'Crear Usuario', redirect: '/createProfesorAdmin' },
    //   { image: 'assets/Gestión web.jpg', title: 'Gestión de web', redirect: '/gestion_web' },
    //   { image: 'assets/Clases a dictar.jpg', title: 'Clases a dictar', redirect: '/clases_dictar' },
    //   { image: 'assets/Registro de horarios.jpg', title: 'Registro de Horarios', redirect: '/registro_horarios' },
    //   { image: 'assets/Historial de clases.jpg', title: 'Historial de clases', redirect: '/historial_clases' },
    //   { image: 'assets/Registro de clases.jpg', title: 'Reserva de clases', redirect: '/reservar_clases' }
    // ];

    if (rol == 'ADMIN') {
      newModulos.push({ image: 'assets/Confirmación de reservas.jpg', title: 'Confirmación de Reservas', redirect: '/confirmacion_reservas' });
      newModulos.push({ image: 'assets/Horario de profesores.jpg', title: 'Horario de Profesores', redirect: '/horarios_profesor' });
      newModulos.push({ image: 'assets/Crear usuario.jpg', title: 'Crear Usuario', redirect: '/createProfesorAdmin' });
      newModulos.push({ image: 'assets/Gestión web.jpg', title: 'Gestión de web', redirect: '/gestion_web' });
      newModulos.push({ image: 'assets/Resportería.jpg', title: 'Reportes', redirect: '/reportes' });
    } else if (rol == 'PROFESOR') {
      newModulos.push({ image: 'assets/Clases a dictar.jpg', title: 'Clases a dictar', redirect: '/clases_dictar' });
      newModulos.push({ image: 'assets/Registro de horarios.jpg', title: 'Registro de Horarios', redirect: '/registro_horarios' });
    } else if (rol == 'ESTUDIANTE') {
      newModulos.push({ image: 'assets/Historial de clases.jpg', title: 'Mis paquetes y clases', redirect: '/historial_clases' });
      newModulos.push({ image: 'assets/Registro de clases.jpg', title: 'Nueva reserva', redirect: '/reservar_clases' });
    }
    return newModulos;
  }

  formatearFechaPeru(utcString: string) {
    const fechaUTC = new Date(utcString);

    // Opciones para formatear fecha y hora en español y zona horaria Perú
    const fecha = fechaUTC.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric' as const
    });

    return fecha;
  }

  formatearHoraPeru(utcString: string) {
    const fechaUTC = new Date(utcString);

    const hora = fechaUTC.toLocaleTimeString('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // pon true si quieres formato 12h
    });

    return hora;
  }

  parseFecha(fechaStr: string) {
    const [dia, mes, anio] = fechaStr.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
  }

  parseHora(horaStr: string, baseDate: Date) {
    let [time, meridian] = horaStr.split(/(am|pm)/i).filter(Boolean);
    let [h, m] = time.trim().split(":").map(Number);

    if (meridian.toLowerCase() === "pm" && h < 12) h += 12;
    if (meridian.toLowerCase() === "am" && h === 12) h = 0;

    const date = new Date(baseDate);
    date.setHours(h, m, 0, 0);
    return date;
  }

  estadoReserva(cadena: string) {
    const [rango, diaSemana, horario] = cadena.split("|");
    const [inicioStr, finStr] = rango.split(" - ");
    const [horaInicioStr, horaFinStr] = horario.split(" - ");

    const inicioSemana = this.parseFecha(inicioStr.trim());
    const finSemana = this.parseFecha(finStr.trim());

    const diasMap: Record<string, number> = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIÉRCOLES: 3,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SÁBADO: 6,
      SABADO: 6,
    };

    let fechaClase = new Date(inicioSemana);
    while (fechaClase <= finSemana && fechaClase.getDay() !== diasMap[diaSemana]) {
      fechaClase.setDate(fechaClase.getDate() + 1);
    }

    if (fechaClase > finSemana) return "No encontrado en ese rango";

    const fechaInicio = this.parseHora(horaInicioStr, fechaClase);
    const fechaFin = this.parseHora(horaFinStr, fechaClase);

    const ahora = new Date();

    if (ahora < fechaInicio) return "Aún no empieza";
    if (ahora > fechaFin) return "Ya pasó";
    return "En curso";
  }

  resumenReservas(reservas: string[]) {
    let yaPasaron = 0;

    for (const r of reservas) {
      const estado = this.estadoReserva(r);

      if (estado === "Ya pasó") yaPasaron++;
    }

    return yaPasaron;
  }

  reservasPendientes(reservas: string[]) {
    const aunNoEmpiezan = [];

    for (const r of reservas) {
      const estado = this.estadoReserva(r);

      if (estado === "Aún no empieza") aunNoEmpiezan.push(r);
    }

    return aunNoEmpiezan;
  }

  reservasArray(reservas: string[]) {
    const array = [];

    for (const r of reservas) {
      array.push(r);
    }

    return array;
  }

  ordenarReservasString(reservas: string) {
    if (reservas === '') return [];

    const semanas = this.intervaloSemana();
    const dias = this.diasSemanaString();

    const reservasArray = reservas.split('#');

    let nuevasReservas: string[] = [];

    for (const semana of semanas) {
      for (const dia of dias) {
        const searchHorario = reservasArray.filter((r) => r.includes(`${semana.id}|${dia}|`));

        if (searchHorario.length > 0) {
          if (nuevasReservas.length > 0) {
            nuevasReservas = nuevasReservas.concat(searchHorario[0]);
          } else {
            nuevasReservas = searchHorario;
          }
        }
      }
    }

        for(const reserva of reservasArray) {

    }

    return nuevasReservas;
  }

  buscarClasesPasadas(reservas: string[]) {
    let semanas = (this.intervaloSemana()).map(s => s.id);

    const clasesSemanasPasadas: string[] = [];
    
    for (const reserva of reservas) {
      const reservaSplit = reserva.split('|');
      const semana = reservaSplit[0];

      if (!semanas.includes(semana)) {
        clasesSemanasPasadas.push(reserva);
      }
    }

    return clasesSemanasPasadas;
  }

  changeFechasInicio(fechaInicio: Date | null | undefined) {
    let desde: string = '';
    
    if (fechaInicio) {
      // Fecha de inicio siempre a las 05:00:00 UTC
      const fechaDesde = new Date(fechaInicio);
      fechaDesde.setUTCHours(5, 0, 0, 0); // 05:00:00 UTC
      desde = fechaDesde.toISOString();
    }

    return desde;
  }

  changeFechasFin(fechaFin: Date | null | undefined) {
    let hasta: string = '';
    
    if (fechaFin) {
      // Fecha fin + 1 día a las 05:00:00 UTC
      const fechaHasta = new Date(fechaFin);
      fechaHasta.setUTCDate(fechaHasta.getUTCDate() + 1); // Agregar 1 día
      fechaHasta.setUTCHours(5, 0, 0, 0); // 05:00:00 UTC
      hasta = fechaHasta.toISOString();
    }
    return hasta;
  }
}
