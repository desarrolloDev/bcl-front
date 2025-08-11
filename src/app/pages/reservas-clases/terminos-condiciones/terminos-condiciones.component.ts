import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent
  ],
  templateUrl: './terminos-condiciones.component.html',
  styleUrl: './terminos-condiciones.component.scss'
})
export class TerminosCondicionesComponent implements OnInit {
  @Output() cambiarVista = new EventEmitter<number>();

  isSmallScreen: boolean = false;

  checkTerminos: boolean = false;
  terminosCondiciones = `
        <span class="text-[16px] text-[#002B3E] font-bold">Términos y Condiciones de Reserva de Clases</span>
        
        <span class="text-[14px] text-[#002B3E]">Confirmación de Pago y Reserva</span>
        
        <div class="pl-8">
            <li class="text-[14px] text-[#002B3E]">Para confirmar tu reserva, debes seguir los pasos indicados en la plataforma. Nuestra Coordinadora Académica verificará el pago y confirmará la reserva en el sistema (podrás ver si tu paquete ha sido confirmado en el módulo de “Historial de Paquetes”). </li>
            <li class="text-[14px] text-[#002B3E]">No se realizará ninguna clase sin la confirmación previa del pago del paquete seleccionado y su registro en el sistema.</li>
        </div>

        <span class="text-[14px] text-[#002B3E]">Disponibilidad de Horarios</span>

        <div class="pl-8">
            <li class="text-[14px] text-[#002B3E]">Al acceder a nuestro portal de reservas, podrás visualizar los horarios disponibles de los profesores para la semana actual y la siguiente.</li>
            <li class="text-[14px] text-[#002B3E]">Los profesores no están obligados a publicar horarios más allá de este periodo, aunque algunos pueden hacerlo voluntariamente.</li>
            <li class="text-[14px] text-[#002B3E]">Los profesores publicarán sus horarios con una semana de anticipación. Por ejemplo, si hoy es lunes 1 de abril, los horarios del 8 al 15 de abril estarán disponibles antes de las 9:00 a. m.</li>
        </div>
        
        <span class="text-[14px] text-[#002B3E]">Reservas de Sesiones</span>

        <div class="pl-8">
            <li class="text-[14px] text-[#002B3E]">Si no puedes reservar todas tus sesiones porque abarcan una semana posterior y el profesor aún no ha publicado sus horarios, podrás completar la reserva más adelante desde el módulo “Historial de Paquetes”.</li>
            <li class="text-[14px] text-[#002B3E]">Para iniciar el proceso de reserva, debes agendar al menos una sesión, independientemente del paquete que compres. Una vez confirmado el pago, podrás reservar el resto de tus sesiones desde el módulo “Historial de Paquetes”.</li>
            <li class="text-[14px] text-[#002B3E]">Para reservar una clase para el día siguiente, la solicitud y el pago deben realizarse antes de las 7:00 p. m. y debe haber disponibilidad de horarios.</li>
            <li class="text-[14px] text-[#002B3E]">Después de las 7:00 p. m., solo se podrán reservar clases a partir del día subsiguiente.</li>
        </div>

        <span class="text-[14px] text-[#002B3E]">Reprogramaciones</span>

        <div class="pl-8">
            <li class="text-[14px] text-[#002B3E]">Cada clase puede reprogramarse una sola vez. Después de esto, no se realizarán devoluciones.</li>
            <li class="text-[14px] text-[#002B3E]">Las reprogramaciones deben gestionarse directamente con nuestra Coordinadora Académica, quien se encargará de actualizar el horario en el sistema y se debe realizar previo a la hora de inicio de la clase.</li>
        </div>
  `;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private fs: FirestoreService
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  ngOnInit() {
    const terminos_cond_reservas = localStorage.getItem('terminos_cond_reservas');
    this.checkTerminos = String(terminos_cond_reservas) == 'true' ? true :  false;
  }

  continuar() {
    this.fs.updateSubColeccionData('user', localStorage.getItem('correo') || '', { terminos_cond_reservas: true }, 'terminos_cond_reservas');
    localStorage.setItem('terminos_cond_reservas', 'true');
    this.cambiarVista.emit(2);
  }
}
