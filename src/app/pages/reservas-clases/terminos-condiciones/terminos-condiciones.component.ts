import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { GetDataService } from '../../../services/getData.service';

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

  terminos: string = '';
  checkTerminos: boolean = false;

  constructor(
    private getDataService: GetDataService,
  ) { }

  async ngOnInit() {
    this.terminos = await this.getDataService.getDataAlumnosTC();
  }

  continuar() {
    this.cambiarVista.emit(2);
  }
}
