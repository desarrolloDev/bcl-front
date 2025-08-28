import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ButtonBackComponent } from '../../../../ui/button-back/button-back.component';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [
    CommonModule,
    ButtonBackComponent
  ],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss'
})
export class ConfirmacionComponent implements OnInit {
  @Input() detalleReserva: any = {};
  isSmallScreen: boolean = false;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([`(max-width: 1364px)`])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
      });
  }

  ngOnInit() {
    
  }

  volverMenu() {
    this.router.navigate(['/dashboard'])
  }
}
