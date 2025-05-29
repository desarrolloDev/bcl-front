import { Component } from '@angular/core';

@Component({
  selector: 'app-historial-clases',
  imports: [],
  templateUrl: './historial-clases.component.html',
  styleUrl: './historial-clases.component.scss'
})
export class HistorialClasesComponent {
usuarios = [
    { id: 1, nombre: 'Ana', correo: 'ana@example.com' },
    { id: 2, nombre: 'Luis', correo: 'luis@example.com' },
    { id: 3, nombre: 'Carlos', correo: 'carlos@example.com' }
  ];
}
