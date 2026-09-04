import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { SaludComponent } from './features/salud/salud.component';
import { ProduccionComponent } from './features/produccion/produccion.component';
import { ReproduccionComponent } from './features/reproduccion/reproduccion.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'salud', component: SaludComponent, canActivate: [authGuard] },
  { path: 'produccion', component: ProduccionComponent, canActivate: [authGuard] },
  { path: 'reproduccion', component: ReproduccionComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];