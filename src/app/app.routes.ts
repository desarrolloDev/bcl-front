import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminWebComponent } from './pages/admin-web/admin-web.component';
import { CreateProfesorComponent } from './pages/create-profesor/create-profesor.component';
import { RegistroHorariosComponent } from './pages/registro-horarios/registro-horarios.component';
import { HorariosProfComponent } from './pages/horarios-prof/horarios-prof.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'createUser', component: CreateUserComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'gestion_web', component: AdminWebComponent, canActivate: [AuthGuard] },
    { path: 'createProfesorAdmin', component: CreateProfesorComponent, canActivate: [AuthGuard] },
    { path: 'registro_horarios', component: RegistroHorariosComponent, canActivate: [AuthGuard] },
    { path: 'horarios_profesor', component: HorariosProfComponent, canActivate: [AuthGuard] }
];