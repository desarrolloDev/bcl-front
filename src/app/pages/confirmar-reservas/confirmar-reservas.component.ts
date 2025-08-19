import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { InputComponent } from '../../ui/input/input.component';
import { CalendarInputComponent } from '../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { GestionHorariosComponent } from './gestion-horarios/gestion-horarios.component';
import { AwsService } from '../../services/aws.service';
import { ListService } from '../../services/list.service';
import { SelectComponent } from '../../ui/select/select.component';
import { ModalService } from '../../ui/modal/modal.service';

@Component({
  selector: 'app-confirmar-reservas',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    GestionHorariosComponent,
    SelectComponent
  ],
  templateUrl: './confirmar-reservas.component.html',
  styleUrl: './confirmar-reservas.component.scss'
})
export class ConfirmarReservasComponent implements OnInit {
private _fb = inject(NonNullableFormBuilder);

  isSmallScreen: boolean = false;
  
  maxDate = new Date(); // Fecha máxima para los calendarios (hoy)

  currentPage = 1;
  totalItems = 42;
  pageSize = 10;

  pageView: number = 1;

  listStatus = [
    { id: 'Pendiente', nombre: 'Pendiente' },
    { id: 'Confirmado', nombre: 'Confirmado' },
    { id: 'Cancelado', nombre: 'Cancelado' }
  ];

  public form = this._fb.group({
    fecha_inicio: this._fb.control<Date | null>(null, [Validators.required]),
    fecha_fin: this._fb.control<Date | null>(null, [Validators.required]),
    profesor: this._fb.control<string>('', [Validators.required]),
    alumno: this._fb.control<string>('', [Validators.required]),
  });

  usuarios: any = [];
  
  usuarioSelect: any = {};

  constructor(
      private breakpointObserver: BreakpointObserver,
      private router: Router,
      private awsService: AwsService,
      public listService: ListService,
      private modalService: ModalService
    ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  async ngOnInit() {
  const hoy = new Date();

  const haceUnaSemana = new Date(hoy);
  haceUnaSemana.setDate(hoy.getDate() - 7);

  this.form.patchValue({
    fecha_inicio: haceUnaSemana,
    fecha_fin: hoy
  });

    await this.buscar();
  }

  async buscar() {
    const profesor = this.form.value.profesor;
    const alumno = this.form.value.alumno;
    const desde = this.form.value.fecha_inicio;
    const hasta = this.form.value.fecha_fin;

    await this.awsService.get(`items?tipo=reservas_fecha&desde=${desde}&hasta=${hasta}`)
      .then((response: any) => {
        console.log('Response:', response);
        const reservas = JSON.parse(response.body);
        this.usuarios = reservas.map((usuario: any) => ({
          fecha_reserva: usuario.fecha_reserva,
          fecha: this.listService.formatearFechaPeru(usuario.fecha_reserva),
          hora: this.listService.formatearHoraPeru(usuario.fecha_reserva),
          tipo: usuario.tipoClase,
          alumno: usuario.alumno_nombre,
          alumno_id: usuario.alumno,
          profesor: usuario.profesor_nombre,
          profesor_id: usuario.profesor,
          paquete: usuario.paqueteClase,
          curso: usuario.curso,
          tema: usuario.tema,
          colegio: usuario.colegio,
          estatus: usuario.status,
          clasesTotal: usuario.clasesTotal,
          horarios: usuario.horarios
        }));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
  }

  changeStatus(usuario: any) {
    const body = {
      tipo: 'actualizarReserva',
      fecha_reserva: usuario.fecha_reserva,
      params: 'status',
      value: usuario.estatus,
      reservasPendientes: usuario.estatus === 'Cancelado' ? this.listService.reservasPendientes(usuario.horarios) : [],
      profesor: usuario.profesor_id,
      id_alumno: `${usuario.alumno}|${usuario.curso}|${usuario.alumno_id}`
    };

    this.awsService.post('items', body)
      .then((response) => {
        this.modalService.openResultDialog(true, 'Estatus de reserva actualizado correctamente.');
      })
      .catch((error) => {
        console.error('Error al guardar horarios', error);
        this.modalService.openResultDialog(false, 'Error al actualizar el estatus, intenta nuevamente más tarde.');
      });
  }

  onPageChange(event: number) {
    console.log('Página nueva:', event);
  }

  actualizarReserva(usuario: any) {
    this.usuarioSelect = usuario;
    this.cambiarVista(2);
  }

  cambiarVista(nroVista: any) {
    this.pageView = nroVista;
  }

  home() {
    this.router.navigate(['/dashboard'])
  }
}
