import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { SaludComponent } from './features/salud/salud.component';
import { ProduccionComponent } from './features/produccion/produccion.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'salud', component: SaludComponent },
  { path: 'produccion', component: ProduccionComponent },
  { path: '**', redirectTo: '' }
];