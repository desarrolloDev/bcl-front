import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarInputComponent } from '../../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../../ui/pagination/pagination.component';
import { ModalService } from '../../../ui/modal/modal.service';
import { ActualizarReservaComponent } from './actualizar-reserva/actualizar-reserva.component';
import { AwsService } from '../../../services/aws.service';
import { ListService } from '../../../services/list.service';
import { ButtonBackComponent } from '../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-historial-clases',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    ActualizarReservaComponent,
    ButtonBackComponent
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

  usuarioSelect: any = {};

  constructor(
    private modalService: ModalService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private awsService: AwsService,
    public listService: ListService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
    const hoy = new Date();

    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.form.patchValue({
      fecha_inicio: haceUnMes,
      fecha_fin: hoy
    });

    await this.buscar();
  }

  async buscar() {
    const profesor = this.form.value.profesor;
    const fechaInicio = this.form.value.fecha_inicio;
    const fechaFin = this.form.value.fecha_fin;
    
    // Ajustar fechas antes de enviar
    const desde = this.listService.changeFechasInicio(fechaInicio);
    const hasta = this.listService.changeFechasFin(fechaFin);

    console.log('desde', desde);
    console.log('hasta', hasta);

    await this.awsService.get(`items?tipo=reservas_fecha&alumno=${localStorage.getItem('correo')}&desde=${desde}&hasta=${hasta}`)
      .then((response: any) => {
        console.log('Response:', response);
        const reservas = JSON.parse(response.body);
        this.usuarios = reservas.map((usuario: any) => ({
          fecha: this.listService.formatearFechaPeru(usuario.fecha_reserva),
          hora: this.listService.formatearHoraPeru(usuario.fecha_reserva),
          fecha_reserva: usuario.fecha_reserva,
          tipo: usuario.tipoClase,
          paquete: usuario.paqueteClase,
          profesor: usuario.profesor_nombre,
          profesor_id: usuario.profesor,
          alumno: usuario.alumno_nombre,
          alumno_id: usuario.alumno,
          curso: usuario.curso,
          tema: usuario.tema,
          colegio: usuario.colegio,
          estatus: usuario.status,
          clasesTotal: usuario.clasesTotal,
          clasesReservadas: usuario.clasesReservadas,
          horarios: usuario.horarios,
          gradoCiclo: usuario.gradoCiclo,
          recompensa: usuario.recompensa,
          precio: usuario.precio
        }));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
  }

  onPageChange(event: number) {
    console.log('Página nueva:', event);
  }

  async actualizarReserva(usuario: any) {
    console.log('Actualizar reserva');
    
    const confirmed = await this.modalService.openConfirmDialog({ 
      titulo: '¡Recuerda que este módulo solo es para completar tus reservas, no podrás reprogramar ninguna clase!',
      mensaje: 'En caso desees reprogramar una clase contactate con nuestra Coordinadora Académica',
      type: '',
      msgBtnAceptar: 'Continuar',
      msgBtCerrar: 'Volver al menú'
    }).toPromise();

    if (confirmed) {
      this.usuarioSelect = usuario;
      this.cambiarVista(2);
    }
  }

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }
}
