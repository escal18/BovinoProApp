import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importamos los 4 servicios principales
import { InventarioService } from '../../core/services/inventario.service';
import { ProduccionService } from '../../core/services/produccion.service';
import { SaludService } from '../../core/services/salud.service';
import { ReproduccionService } from '../../core/services/reproduccion.service';

import { EventoReproduccion } from '../../core/models/reproduccion.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cargando: boolean = true;
  fechaActual: Date = new Date();

  // Métricas de Inventario
  totalBovinos: number = 0;
  vacasProductoras: number = 0;
  ternerasYBecerras: number = 0;

  // Métricas de Producción (Semana Actual)
  litrosSemana: number = 0;
  lecheSeparadaSemana: number = 0;

  // Métricas de Salud y Reproducción
  animalesEnTratamiento: number = 0;
  vacasGestantes: number = 0;

  // Alertas
  alertasSalud: any[] = [];
  alertasPartos: EventoReproduccion[] = []; 

  constructor(
    private inventarioService: InventarioService,
    private produccionService: ProduccionService,
    private saludService: SaludService,
    private reproduccionService: ReproduccionService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // 1. Cargar Inventario
    this.inventarioService.getAnimales().subscribe(animales => {
      this.totalBovinos = animales.filter(a => a.estado === 'Activo' || a.estado === 'En Tratamiento').length;
      this.vacasProductoras = animales.filter(a => a.etapaDesarrollo === 'Productora' && a.estado !== 'Vendido' && a.estado !== 'Fallecido').length;
      this.ternerasYBecerras = animales.filter(a => (a.etapaDesarrollo === 'Ternera' || a.etapaDesarrollo === 'Becerra') && a.estado !== 'Vendido' && a.estado !== 'Fallecido').length;
      this.animalesEnTratamiento = animales.filter(a => a.estado === 'En Tratamiento').length;
    });

    // 2. Cargar Producción
    this.produccionService.getTodosLosRegistros().subscribe(registros => {
      const registrosSemana = registros.filter(reg => this.estaEnSemanaActual(reg.fecha));
      
      this.litrosSemana = registrosSemana
        .filter(r => r.tipoRegistro === 'Tanque General')
        .reduce((acc, curr) => acc + (curr.litrosProducidos || 0), 0);
        
      this.lecheSeparadaSemana = registrosSemana
        .filter(r => r.tipoRegistro === 'Individual')
        .reduce((acc, curr) => acc + (curr.litrosProducidos || 0), 0);
    });

    // 3. Cargar Reproducción
    this.reproduccionService.getEventos().subscribe((eventos: EventoReproduccion[]) => {
      // ¡CORREGIDO! Usamos resultadoTacto === 'Positivo (Gestante)'
      const gestaciones = eventos.filter((e: EventoReproduccion) => e.resultadoTacto === 'Positivo (Gestante)');
      this.vacasGestantes = gestaciones.length;
      
      const hoy = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(hoy.getDate() + 30);
      
      this.alertasPartos = gestaciones.filter((e: EventoReproduccion) => {
        if(!e.fechaProbableParto) return false;
        const fechaParto = new Date(e.fechaProbableParto as string);
        return fechaParto >= hoy && fechaParto <= en30Dias;
      }).sort((a: EventoReproduccion, b: EventoReproduccion) => {
        const dateA = a.fechaProbableParto ? new Date(a.fechaProbableParto as string).getTime() : 0;
        const dateB = b.fechaProbableParto ? new Date(b.fechaProbableParto as string).getTime() : 0;
        return dateA - dateB;
      });
      
      this.cargando = false;
    });
  }

  // Utilidad para la semana actual
  estaEnSemanaActual(fechaVal: any): boolean {
    if (!fechaVal) return false;
    let fechaRegistro = new Date(fechaVal);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diaSemana = hoy.getDay() || 7; 
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana + 1);
    lunes.setHours(0,0,0,0);
    
    return fechaRegistro.getTime() >= lunes.getTime();
  }
}