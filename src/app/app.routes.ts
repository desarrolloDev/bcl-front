// import { Routes } from '@angular/router';
// import { HomeComponent } from './core/pages/home/home.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'createUser', component: CreateUserComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
];