import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirestoreService } from '../../services/firestore.service';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    SpinnerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  rol: string = '';

  modulos: { image: string; title: string; redirect: string; }[] = [];

  constructor(
    private fs: FirestoreService,
    private router: Router,
    public listService: ListService,
    private authService: AuthService
  ) {}
  

  ngOnInit() {
    const correo = localStorage.getItem('correo');
    const rol = localStorage.getItem('rol');

    if (correo && !rol) {
      this.fs.getItemByEmail(correo).then((dataUser) => {

        this.authService.setNombre(dataUser.nombre);
        localStorage.setItem('nombre', dataUser.nombre);
        localStorage.setItem('apellido', dataUser.apellido);
        localStorage.setItem('rol', dataUser.rol);

        this.rol = dataUser.rol;
        this.modulos = this.listService.modulosDashboard(dataUser.rol);
      }).catch(err => console.error('Error al listar data:', err));
    } else if (rol) {
      this.rol = rol;
      this.modulos = this.listService.modulosDashboard(rol);
    }
  }

  onClick(ruta: string) {
    this.router.navigate([ruta])
  }
}
