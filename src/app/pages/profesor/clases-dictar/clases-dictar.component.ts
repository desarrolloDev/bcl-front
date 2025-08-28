import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { InputComponent } from '../../../ui/input/input.component';
import { CalendarInputComponent } from '../../../ui/calendar-input/calendar-input.component';
import { PaginationComponent } from '../../../ui/pagination/pagination.component';
import { CalendarioHorariosComponent } from './calendario-horarios/calendario-horarios.component';
import { ListService } from '../../../services/list.service';
import { AwsService } from '../../../services/aws.service';
import { ButtonBackComponent } from '../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-clases-dictar',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    CalendarInputComponent,
    PaginationComponent,
    MatIconModule,
    CalendarioHorariosComponent,
    MatStepperModule,
    ButtonBackComponent
],
  templateUrl: './clases-dictar.component.html',
  styleUrl: './clases-dictar.component.scss'
})
export class ClasesDictarComponent implements OnInit {
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
    alumno: this._fb.control<string>('', [Validators.required]),
    status: this._fb.control<string>('', [Validators.required]),
  });

  listStatus = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Confirmado', label: 'Confirmado' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  usuarios: any[] = [];

  constructor(
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

    const haceUnaSemana = new Date(hoy);
    haceUnaSemana.setDate(hoy.getDate() - 7);

    this.form.patchValue({
      fecha_inicio: haceUnaSemana,
      fecha_fin: hoy
    });

    await this.buscar();
  }

  async buscar() {
    const status = this.form.value.status;
    const alumno = this.form.value.alumno;
    const desde = this.form.value.fecha_inicio;
    const hasta = this.form.value.fecha_fin;

    await this.awsService.get(`items?tipo=reservas_fecha&profesor=${localStorage.getItem('correo')}&desde=${desde}&hasta=${hasta}`)
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
          clasesReservadas: usuario.clasesReservadas,
          horarios: usuario.horarios
        }));
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
  }

  onPageChange(event: number) {
    console.log('Página nueva:', event);
  }

  cambiarVista(nroVista: number) {
    this.pageView = nroVista;
  }

  home() {
    this.router.navigate(['/dashboard'])
  }
}
