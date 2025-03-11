import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadChildren: () => import('./pages/main/main.routes').then((e) => e.MAIN_ROUTES),
    },
    {
        path: '**',
        redirectTo: ''
    }
];
