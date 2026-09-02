import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  fechaActual: Date = new Date();
  mesSeleccionado: Date = new Date();
  
  nombreMeses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  nombreMesActual: string = '';
  anioActual: number = 0;
  
  diasDelMes: any[] = [];
  diaActivo: any = null;

  // Anotaciones de ejemplo enlazadas a las opciones del sistema
  anotaciones = [
    { fecha: '2026-09-01', tipo: 'produccion', titulo: 'Registro de Ordeña', descripcion: 'Promedio: 32.5 Lts - 45 Vacas' },
    { fecha: '2026-09-12', tipo: 'nacimiento', titulo: 'Parto Programado', descripcion: 'Vaca #4432 (Lote B)' },
    { fecha: '2026-09-15', tipo: 'alerta', titulo: 'Alerta Sanitaria', descripcion: 'Falta vacuna Brucelosis - Vaca #6789' }
  ];

  ngOnInit(): void {
    this.generarCalendario();
  }

  generarCalendario() {
    this.diasDelMes = [];
    const anio = this.mesSeleccionado.getFullYear();
    const mes = this.mesSeleccionado.getMonth();
    
    this.nombreMesActual = this.nombreMeses[mes];
    this.anioActual = anio;

    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnElMes = new Date(anio, mes + 1, 0).getDate();

    // Espacios vacíos previos al inicio del mes
    for (let i = 0; i < primerDia; i++) {
      this.diasDelMes.push({ numero: null, vacio: true });
    }

    // Días reales del mes
    for (let i = 1; i <= diasEnElMes; i++) {
      const mesStr = (mes + 1).toString().padStart(2, '0');
      const diaStr = i.toString().padStart(2, '0');
      const fechaCompleta = `${anio}-${mesStr}-${diaStr}`;
      
      const eventosDelDia = this.anotaciones.filter(a => a.fecha === fechaCompleta);
      
      const esHoy = (
        i === this.fechaActual.getDate() && 
        mes === this.fechaActual.getMonth() && 
        anio === this.fechaActual.getFullYear()
      );

      const diaObj = {
        numero: i,
        vacio: false,
        esHoy: esHoy,
        fechaOriginal: fechaCompleta,
        eventos: eventosDelDia
      };

      this.diasDelMes.push(diaObj);

      if (esHoy && !this.diaActivo) {
        this.seleccionarDia(diaObj);
      }
    }
  }

  cambiarMes(incremento: number) {
    this.mesSeleccionado.setMonth(this.mesSeleccionado.getMonth() + incremento);
    this.generarCalendario();
  }

  seleccionarDia(dia: any) {
    if (dia.vacio) return;
    this.diaActivo = dia;
  }
}