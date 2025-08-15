import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { InputComponent } from '../../ui/input/input.component';
import { CalendarInputComponent } from '../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { ModalService } from '../../ui/modal/modal.service';
import { ActualizarReservaComponent } from './actualizar-reserva/actualizar-reserva.component';
import { AwsService } from '../../services/aws.service';

@Component({
  selector: 'app-historial-clases',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    ActualizarReservaComponent
  ],
  templateUrl: './historial-clases.component.html',
  styleUrl: './historial-clases.component.scss'
})
export class HistorialClasesComponent implements OnInit {
  private _fb = inject(NonNullableFormBuilder);

  isSmallScreen: boolean = false;
  
  maxDate = new Date(); // Fecha máxima para los calendarios (hoy)

  currentPage = 1;
  totalItems = 42;
  pageSize = 10;

  pageView: number = 1;

  public form = this._fb.group({
    fecha_inicio: this._fb.control<Date | null>(null, [Validators.required]),
    fecha_fin: this._fb.control<Date | null>(null, [Validators.required]),
    profesor: this._fb.control<string>('', []),
  });

  usuarios: any[] = [];

  // { fecha: '15/07/2025', hora: '10:00', tipo: 'Individual', paquete: '4 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Pendiente', estatusCompleto: 'No disponible' },
  // { fecha: '15/06/2025', hora: '10:00', tipo: 'Individual', paquete: '20 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Confirmado', estatusCompleto: '15 de 20' },
  // { fecha: '15/05/2025', hora: '10:00', tipo: 'Individual', paquete: '4 Clases', profesor: 'Judith Portocarrero', curso: 'IB MATH SL', tema: 'Matemáticas', colegio: 'Colegio A', estatus: 'Cancelado', estatusCompleto: 'No disponible' },

  constructor(
    private modalService: ModalService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private awsService: AwsService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    const hoy = new Date();

    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    this.form.patchValue({
      fecha_inicio: lunes,
      fecha_fin: domingo
    });

    await this.buscar();
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

  async buscar() {
    const profesor = this.form.value.profesor;
    const desde = this.form.value.fecha_inicio;
    const hasta = this.form.value.fecha_fin;

    await this.awsService.get(`items?tipo=reservas_fecha&desde=${desde}&hasta=${hasta}`)
      .then((response: any) => {
        console.log('Response:', response);
        const reservas = JSON.parse(response.body);
        this.usuarios = reservas.map((usuario: any) => ({
          fecha: this.formatearFechaPeru(usuario.fecha_reserva),
          hora: this.formatearHoraPeru(usuario.fecha_reserva),
          tipo: usuario.tipoClase,
          paquete: usuario.paqueteClase,
          profesor: usuario.profesor_nombre,
          curso: usuario.curso,
          tema: usuario.tema,
          colegio: usuario.colegio,
          estatus: 'Pendiente', /// usuario.estatus,
          estatusCompleto: 'No disponible'// usuario.estatusCompleto
        }));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
  }

  onPageChange(event: number) {
    console.log('Página nueva:', event);
  }

  async actualizarReserva() {
    console.log('Actualizar reserva');
    
    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¡Recuerda que este módulo solo es para completar tus reservas, no podrás reprogramar ninguna clase!',
      mensaje: 'En caso desees reprogramar una clase contactate con nuestra Coordinadora Académica',
      type: '',
      msgBtnAceptar: 'Continuar',
      msgBtCerrar: 'Volver al menú'
    }).toPromise();

    if (confirmed) {
      this.cambiarVista(2);
    }
  }

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }

  home() {
    this.router.navigate(['/dashboard'])
  }
}
