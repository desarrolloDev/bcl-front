import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';

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
export class TerminosCondicionesComponent {
  checkTerminos: boolean = false;

  terminos: string = `
  a. Confirmación de Pago y Reserva
    . Para confirmar tu reserva, debes seguir los pasos indicados en la plataforma. Nuestra Coordinadora Académica verificará el pago y confirmará la reserva en el sistema (podrás ver si tu paquete ha sido confirmado en el módulo de “Historial de Paquetes”). 
    . No se realizará ninguna clase sin la confirmación previa del pago del paquete seleccionado y su registro en el sistema.
  b. Disponibilidad de Horarios
    . Al acceder a nuestro portal de reservas, podrás visualizar los horarios disponibles de los profesores para la semana actual y la siguiente.
    . Los profesores no están obligados a publicar horarios más allá de este periodo, aunque algunos pueden hacerlo voluntariamente.
    . Los profesores publicarán sus horarios con una semana de anticipación. Por ejemplo, si hoy es lunes 1 de abril, los horarios del 8 al 15 de abril estarán disponibles antes de las 9:00 a. m.
  c. Reservas de Sesiones
    . Si no puedes reservar todas tus sesiones porque abarcan una semana posterior y el profesor aún no ha publicado sus horarios, podrás completar la reserva más adelante desde el módulo “Historial de Paquetes”.
    . Para iniciar el proceso de reserva, debes agendar al menos una sesión, independientemente del paquete que compres. Una vez confirmado el pago, podrás reservar el resto de tus sesiones desde el módulo “Historial de Paquetes”.
    . Para reservar una clase para el día siguiente, la solicitud y el pago deben realizarse antes de las 7:00 p. m. y debe haber disponibilidad de horarios.
    . Después de las 7:00 p. m., solo se podrán reservar clases a partir del día subsiguiente.
  d. Reprogramaciones
    . Cada clase puede reprogramarse una sola vez. Después de esto, no se realizarán devoluciones.
    . Las reprogramaciones deben gestionarse directamente con nuestra Coordinadora Académica, quien se encargará de actualizar el horario en el sistema y se debe realizar previo a la hora de inicio de la clase.
  `;

  continuar() {

  }
}
