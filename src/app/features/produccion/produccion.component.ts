import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroProduccion, TipoRegistro } from '../../core/models/produccion.model';
import { ProduccionService } from '../../core/services/produccion.service';
import { InventarioService } from '../../core/services/inventario.service';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css'],
})
export class ProduccionComponent implements OnInit {
  vistaActual: 'lista' | 'formulario' = 'lista';

  modoEdicion: boolean = false;
  idRegistroEditando: string | null = null;
  cargando: boolean = true;

  // Filtros
  filtroBusqueda: string = '';
  filtroFecha: string = '';
  filtroPeriodo: 'semana' | 'todos' = 'semana'; 

  listaProduccion: RegistroProduccion[] = [];
  vacasProductoras: any[] = []; 

  nuevoRegistro: Partial<RegistroProduccion> = {
    tipoRegistro: 'Tanque General',
    fecha: new Date().toISOString().split('T')[0],
  };

  constructor(
    private produccionService: ProduccionService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.produccionService.getTodosLosRegistros().subscribe({
      next: (registros) => {
        this.listaProduccion = registros;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar producción:', error);
        this.cargando = false;
      }
    });

    this.inventarioService.getAnimales().subscribe({
      next: (animales) => {
        this.vacasProductoras = animales.filter(a => a.genero === 'Hembra' && a.etapaDesarrollo === 'Productora');
      }
    });
  }

  // --- LÓGICA DE FECHAS Y CARPETAS SEMANALES ---

  getLunes(fechaVal: any): Date {
    if (!fechaVal) return new Date();
    let d: Date;
    if (typeof fechaVal === 'string') {
      const partes = fechaVal.split('-');
      d = partes.length === 3 ? new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])) : new Date(fechaVal);
    } else if (fechaVal.toDate) {
      d = fechaVal.toDate();
    } else {
      d = new Date(fechaVal);
    }
    
    d.setHours(0, 0, 0, 0);
    const diaSemana = d.getDay() || 7; 
    d.setDate(d.getDate() - diaSemana + 1);
    return d;
  }

  estaEnSemanaActual(fechaVal: any): boolean {
    const lunesRegistro = this.getLunes(fechaVal).getTime();
    const lunesActual = this.getLunes(new Date()).getTime();
    return lunesRegistro === lunesActual;
  }

  formatearFechaCorta(d: Date): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${meses[d.getMonth()]}`;
  }

// Las métricas globales SIEMPRE muestran la semana en curso (inmunes al buscador)
  get metricasSemanaActual() {
    const registrosSemana = this.listaProduccion.filter(reg => this.estaEnSemanaActual(reg.fecha));
    
    // Separamos el tanque de las ordeñas individuales
    const tanque = registrosSemana.filter(r => r.tipoRegistro === 'Tanque General');
    const individuales = registrosSemana.filter(r => r.tipoRegistro === 'Individual');

    return {
      producido: tanque.reduce((acc, curr) => acc + (curr.litrosProducidos || 0), 0),
      vendido: tanque.reduce((acc, curr) => acc + (curr.litrosVendidos || 0), 0),
      diferencia: tanque.reduce((acc, curr) => acc + (curr.diferencia || 0), 0),
      lecheSeparada: individuales.reduce((acc, curr) => acc + (curr.litrosProducidos || 0), 0) // <-- NUEVA SUMA
    };
  }

  // Agrupa las ordeñas en "Carpetas" y aplica los filtros
  get produccionAgrupada() {
    const grupos = new Map<string, any>();
    
    const filtrados = this.listaProduccion.filter(reg => {
      const criterio = (reg.animalId || '') + ' ' + (reg.loteGrupo || '') + ' ' + (reg.registradoPor || '');
      const coincideTexto = criterio.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const coincideFecha = this.filtroFecha ? reg.fecha === this.filtroFecha : true;
      return coincideTexto && coincideFecha;
    });

    filtrados.forEach(reg => {
      const lunes = this.getLunes(reg.fecha);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      
      const idSemana = lunes.toISOString().split('T')[0];
      
      if (!grupos.has(idSemana)) {
        grupos.set(idSemana, {
          idSemana: idSemana,
          titulo: `Semana del ${this.formatearFechaCorta(lunes)} al ${this.formatearFechaCorta(domingo)}`,
          esSemanaActual: this.estaEnSemanaActual(reg.fecha),
          registros: [],
          totalProducido: 0,
          totalVendido: 0,
          diferencia: 0,
          totalSeparada: 0 // <-- NUEVA VARIABLE EN LA CARPETA
        });
      }
      
      const grupo = grupos.get(idSemana);
      grupo.registros.push(reg);
      
      // CONDICIÓN: Solo sumar al total si es del Tanque General
      if (reg.tipoRegistro === 'Tanque General') {
        grupo.totalProducido += (reg.litrosProducidos || 0);
        grupo.totalVendido += (reg.litrosVendidos || 0);
        grupo.diferencia += (reg.diferencia || 0);
      } else {
        // Si es ordeña individual, se va a la leche separada
        grupo.totalSeparada += (reg.litrosProducidos || 0);
      }
    });

    let arrayGrupos = Array.from(grupos.values()).sort((a, b) => b.idSemana.localeCompare(a.idSemana));

    if (this.filtroPeriodo === 'semana' && this.filtroBusqueda.trim() === '' && !this.filtroFecha) {
       arrayGrupos = arrayGrupos.filter(g => g.esSemanaActual);
    }

    return arrayGrupos;
  }

  cambiarVista(vista: 'lista' | 'formulario', registro?: RegistroProduccion) {
    this.vistaActual = vista;
    
    if (vista === 'formulario' && registro) {
      this.modoEdicion = true;
      this.idRegistroEditando = registro.id || null;
      this.nuevoRegistro = { ...registro };
    } else if (vista === 'formulario') {
      this.modoEdicion = false;
      this.idRegistroEditando = null;
      this.nuevoRegistro = {
        tipoRegistro: 'Tanque General',
        fecha: new Date().toISOString().split('T')[0],
      };
    }
  }

  async guardarProduccion() {
    try {
      const producidos = Number(this.nuevoRegistro.litrosProducidos) || 0;
      const vendidosStr = this.nuevoRegistro.litrosVendidos?.toString().trim();
      const vendidos = vendidosStr && vendidosStr !== '' ? Number(vendidosStr) : undefined;

      let diferenciaCalculada: number | undefined = undefined;
      if (vendidos !== undefined && !isNaN(vendidos)) {
        diferenciaCalculada = Number((vendidos - producidos).toFixed(1));
      }

      const registroParaGuardar: Partial<RegistroProduccion> = {
        tipoRegistro: (this.nuevoRegistro.tipoRegistro as TipoRegistro) || 'Tanque General',
        animalId: this.nuevoRegistro.tipoRegistro === 'Individual' ? this.nuevoRegistro.animalId : undefined,
        loteGrupo: this.nuevoRegistro.tipoRegistro === 'Tanque General' ? this.nuevoRegistro.loteGrupo || 'Tanque General' : undefined,
        fecha: this.nuevoRegistro.fecha || new Date().toISOString().split('T')[0],
        litrosProducidos: producidos,
        litrosVendidos: vendidos,
        diferencia: diferenciaCalculada,
        calidadLeche: this.nuevoRegistro.calidadLeche || '',
        registradoPor: this.nuevoRegistro.registradoPor || 'Operador',
      };

      Object.keys(registroParaGuardar).forEach(key => {
        if (registroParaGuardar[key as keyof RegistroProduccion] === undefined) {
          delete registroParaGuardar[key as keyof RegistroProduccion];
        }
      });

      if (this.modoEdicion && this.idRegistroEditando) {
        await this.produccionService.actualizarRegistro(this.idRegistroEditando, registroParaGuardar);
      } else {
        await this.produccionService.agregarRegistro(registroParaGuardar as RegistroProduccion);
      }

      this.cambiarVista('lista');
    } catch (error) {
      console.error('Error al guardar producción:', error);
      alert('Hubo un error al guardar. Revisa la consola para más detalles.');
    }
  }
}