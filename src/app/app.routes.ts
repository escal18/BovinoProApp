import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventarioComponent } from './features/inventario/inventario.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: '**', redirectTo: '' }
];