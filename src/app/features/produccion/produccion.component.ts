import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RegistroProduccion,
  TurnoOrdena,
  TipoRegistro,
} from '../../core/models/produccion.model';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css'],
})
export class ProduccionComponent implements OnInit {
  vistaActual: 'lista' | 'formulario' = 'lista';

  // Control de edición
  modoEdicion: boolean = false;
  idRegistroEditando: string | null = null;

  // Filtros
  filtroBusqueda: string = '';
  filtroTurno: string = '';

  // Datos mock iniciales
  listaProduccion: RegistroProduccion[] = [
    {
      id: '1',
      tipoRegistro: 'Tanque General',
      loteGrupo: 'Tanque Principal de Granja',
      fecha: new Date('2026-09-02'),
      turno: 'Mañana',
      litrosProducidos: 345.0,
      litrosVendidos: 347.0,
      diferencia: -2.0,
      calidadLeche: 'Excelente',
      registradoPor: 'Juan Escalera',
    },
  ];

  nuevoRegistro: Partial<RegistroProduccion> = {
    tipoRegistro: 'Tanque General',
    turno: 'Mañana',
    registradoPor: 'Juan Escalera',
  };

  ngOnInit(): void {}

  get registrosFiltrados(): RegistroProduccion[] {
    return this.listaProduccion.filter((reg) => {
      const criterioBusqueda = reg.animalId || reg.loteGrupo || '';
      const coincideBusqueda =
        criterioBusqueda
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        reg.registradoPor
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase());
      const coincideTurno = this.filtroTurno
        ? reg.turno === this.filtroTurno
        : true;

      return coincideBusqueda && coincideTurno;
    });
  }

  get totalLitrosSemana(): number {
    return this.listaProduccion.reduce(
      (acc, curr) => acc + curr.litrosProducidos,
      0,
    );
  }

  get diferenciaTotalSemana(): number {
    return this.listaProduccion.reduce(
      (acc, curr) => acc + (curr.diferencia || 0),
      0,
    );
  }

  cambiarVista(vista: 'lista' | 'formulario', registro?: RegistroProduccion) {
    this.vistaActual = vista;
    if (vista === 'formulario' && registro) {
      // Modo Edición: Cargamos los datos existentes
      this.modoEdicion = true;
      this.idRegistroEditando = registro.id;
      this.nuevoRegistro = { ...registro };
    } else if (vista === 'formulario') {
      // Modo Creación: Limpiamos
      this.modoEdicion = false;
      this.idRegistroEditando = null;
      this.nuevoRegistro = {
        tipoRegistro: 'Tanque General',
        turno: 'Mañana',
        fecha: new Date(),
        registradoPor: 'Juan Escalera',
      };
    }
  }

  guardarProduccion() {
    const producidos = Number(this.nuevoRegistro.litrosProducidos) || 0;
    const vendidos =
      this.nuevoRegistro.litrosVendidos !== undefined &&
      this.nuevoRegistro.litrosVendidos !== null &&
      this.nuevoRegistro.litrosVendidos !== ('' as any)
        ? Number(this.nuevoRegistro.litrosVendidos)
        : undefined;

    // Fórmula correcta: Litros Vendidos menos Litros Producidos
    let diferenciaCalculada: number | undefined = undefined;
    if (vendidos !== undefined) {
      diferenciaCalculada = Number((vendidos - producidos).toFixed(1));
    }

    if (this.modoEdicion && this.idRegistroEditando) {
      const index = this.listaProduccion.findIndex(
        (r) => r.id === this.idRegistroEditando,
      );
      if (index !== -1) {
        this.listaProduccion[index] = {
          ...this.listaProduccion[index],
          ...this.nuevoRegistro,
          litrosProducidos: producidos,
          litrosVendidos: vendidos,
          diferencia: diferenciaCalculada, // <-- Aquí se actualiza con el nuevo cálculo
          fecha: this.nuevoRegistro.fecha
            ? new Date(this.nuevoRegistro.fecha)
            : this.listaProduccion[index].fecha,
        } as RegistroProduccion;
      }
    } else {
      const registroCreado: RegistroProduccion = {
        id: (this.listaProduccion.length + 1).toString(),
        tipoRegistro:
          (this.nuevoRegistro.tipoRegistro as TipoRegistro) || 'Tanque General',
        animalId:
          this.nuevoRegistro.tipoRegistro === 'Individual'
            ? this.nuevoRegistro.animalId
            : undefined,
        loteGrupo:
          this.nuevoRegistro.tipoRegistro === 'Tanque General'
            ? this.nuevoRegistro.loteGrupo || 'Tanque General'
            : undefined,
        fecha: this.nuevoRegistro.fecha
          ? new Date(this.nuevoRegistro.fecha)
          : new Date(),
        turno: (this.nuevoRegistro.turno as TurnoOrdena) || 'Mañana',
        litrosProducidos: producidos,
        litrosVendidos: vendidos,
        diferencia: diferenciaCalculada, // <-- Aquí guarda la diferencia positiva
        calidadLeche: this.nuevoRegistro.calidadLeche || 'Estándar',
        registradoPor: this.nuevoRegistro.registradoPor || 'Operador',
      };

      this.listaProduccion.unshift(registroCreado);
    }

    this.cambiarVista('lista');
  }
}
