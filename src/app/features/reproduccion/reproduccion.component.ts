import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EventoReproduccion,
  EstadoGestacion,
} from '../../core/models/reproduccion.model';

@Component({
  selector: 'app-reproduccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reproduccion.component.html',
  styleUrls: ['./reproduccion.component.css'],
})
export class ReproduccionComponent implements OnInit {
  vistaActual: 'lista' | 'formulario' = 'lista';

  // Filtros
  filtroBusqueda: string = '';
  filtroEstado: string = '';

  // Datos mock iniciales
  listaReproduccion: EventoReproduccion[] = [
    {
      id: '1',
      hembraId: '01 2345 6789',
      nombreHembra: 'La Pinta',
      fechaInseminacion: new Date('2025-12-01'),
      toroIdOpcional: 'Pajilla Holstein Reg. #882',
      estado: 'Preñada',
      fechaProbableParto: new Date('2026-09-10'),
      complicaciones:
        'Ninguna. Diagnóstico positivo por palpación a los 60 días.',
    },
    {
      id: '2',
      hembraId: '01 9876 5432',
      nombreHembra: 'Lucero',
      fechaInseminacion: new Date('2026-08-15'),
      toroIdOpcional: 'Toro Gyr Lechero',
      estado: 'Inseminada',
      fechaProbableParto: new Date('2027-05-25'),
      complicaciones: 'Pendiente revisión de diagnóstico de preñez.',
    },
  ];

  nuevoRegistro: Partial<EventoReproduccion> = {
    estado: 'Inseminada',
  };

  ngOnInit(): void {}

  get registrosFiltrados(): EventoReproduccion[] {
    return this.listaReproduccion.filter((reg) => {
      const coincideBusqueda =
        reg.hembraId
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        (reg.nombreHembra &&
          reg.nombreHembra
            .toLowerCase()
            .includes(this.filtroBusqueda.toLowerCase())) ||
        (reg.toroIdOpcional &&
          reg.toroIdOpcional
            .toLowerCase()
            .includes(this.filtroBusqueda.toLowerCase()));
      const coincideEstado = this.filtroEstado
        ? reg.estado === this.filtroEstado
        : true;

      return coincideBusqueda && coincideEstado;
    });
  }

  cambiarVista(vista: 'lista' | 'formulario') {
    this.vistaActual = vista;
    if (vista === 'formulario') {
      this.nuevoRegistro = {
        estado: 'Inseminada',
        fechaInseminacion: new Date(),
      };
    }
  }

  guardarReproduccion() {
    let fechaPartoCalc: Date | undefined = undefined;

    // Si hay fecha de inseminación, calculamos la fecha probable de parto (~283 días)
    if (this.nuevoRegistro.fechaInseminacion) {
      const fechaIn = new Date(this.nuevoRegistro.fechaInseminacion);
      fechaIn.setDate(fechaIn.getDate() + 283);
      fechaPartoCalc = fechaIn;
    }

    const registroCreado: EventoReproduccion = {
      id: (this.listaReproduccion.length + 1).toString(),
      hembraId: this.nuevoRegistro.hembraId || '01 0000 0000',
      nombreHembra: this.nuevoRegistro.nombreHembra,
      fechaInseminacion: this.nuevoRegistro.fechaInseminacion
        ? new Date(this.nuevoRegistro.fechaInseminacion)
        : undefined,
      toroIdOpcional: this.nuevoRegistro.toroIdOpcional,
      estado: (this.nuevoRegistro.estado as EstadoGestacion) || 'Inseminada',
      fechaProbableParto: fechaPartoCalc,
      complicaciones: this.nuevoRegistro.complicaciones,
    };

    this.listaReproduccion.unshift(registroCreado);
    this.cambiarVista('lista');
  }
}
