import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoReproduccion } from '../../core/models/reproduccion.model';
import { ReproduccionService } from '../../core/services/reproduccion.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reproduccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reproduccion.component.html',
  styleUrls: ['./reproduccion.component.css']
})
export class ReproduccionComponent implements OnInit {
  private route = inject(ActivatedRoute);

  vistaActual: 'lista' | 'expediente' | 'formulario' = 'lista';
  filtroBusqueda: string = '';
  filtroGestacion: string = 'todas';
  cargando: boolean = true;

  listaEventos: EventoReproduccion[] = [];
  hembrasInventario: any[] = []; 
  
  animalSeleccionadoExpediente: any = null;
  modoEdicion: boolean = false;
  idEventoEditando: string | null = null;
  nuevoEvento: Partial<EventoReproduccion> = {};

  constructor(
    private reproduccionService: ReproduccionService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit() {
    // 1. Leer parámetros de la URL enviados desde el Dashboard
    this.route.queryParams.subscribe(params => {
      if (params['filtro'] === 'gestantes') {
        this.filtroGestacion = 'gestantes';
      }
    });

    // 2. Cargar el inventario (solo hembras)
    this.inventarioService.getAnimales().subscribe({
      next: (animales: any[]) => {
        this.hembrasInventario = animales.filter(a => a.genero === 'Hembra');
      }
    });

    // 3. Cargar TODO el historial reproductivo
    this.reproduccionService.getEventos().subscribe({
      next: (eventos: EventoReproduccion[]) => {
        this.listaEventos = eventos;
      },
      error: (error: any) => { // <-- CORRECCIÓN AQUÍ: ': any' añadido
        console.error('Error al cargar eventos reproductivos:', error);
      }
    });
  }

  aplicarFiltros() {
    // La reactividad de Angular llamará al getter expedientesFiltrados automáticamente
  }

  // Función que determina si una vaca está preñada basándose en sus eventos
  esVacaGestante(animalId: string): boolean {
    if (!this.listaEventos || this.listaEventos.length === 0) return false;
    
    // Filtrar eventos de esta vaca y ordenarlos por fecha (el más reciente primero)
    const eventosAnimal = this.listaEventos
      .filter(e => e.animalId === animalId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Buscamos el último diagnóstico positivo y el último parto
    const ultimoTactoPositivo = eventosAnimal.find(e => e.tipo === 'Diagnóstico de Gestación' && e.resultadoTacto === 'Positivo (Gestante)');
    const ultimoParto = eventosAnimal.find(e => e.tipo === 'Parto');

    if (ultimoTactoPositivo) {
      // Si tuvo un tacto positivo pero aún no tiene ningún parto registrado, ESTÁ GESTANTE.
      if (!ultimoParto) return true;
      // Si tuvo un tacto positivo DESPUÉS de su último parto, ESTÁ GESTANTE.
      return new Date(ultimoTactoPositivo.fecha) > new Date(ultimoParto.fecha);
    }

    return false;
  }

  get expedientesFiltrados() {
    const ordenEtapas: { [key: string]: number } = {
      'Ternera': 1,
      'Becerra': 2,
      'Productora': 3,
      'Seca': 4,
      'Semental': 5
    };

    let filtrados = this.hembrasInventario.filter(animal => {
      // Filtro de Texto
      const coincideTexto = (animal.areteSiniiga?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
              (animal.nombreOpcional && animal.nombreOpcional.toLowerCase().includes(this.filtroBusqueda.toLowerCase())));
      
      // Filtro de Gestación
      const esGestante = this.esVacaGestante(animal.id);
      const coincideGestacion = this.filtroGestacion === 'todas' ? true : esGestante;

      return coincideTexto && coincideGestacion;
    });

    return filtrados.sort((a, b) => {
      const etapaA = ordenEtapas[a.etapaDesarrollo || ''] || 99;
      const etapaB = ordenEtapas[b.etapaDesarrollo || ''] || 99;
      return etapaA - etapaB;
    });
  }

  get eventosDelExpediente(): EventoReproduccion[] {
    if (!this.animalSeleccionadoExpediente) return [];
    return this.listaEventos.filter(e => e.animalId === this.animalSeleccionadoExpediente.id);
  }

  // --- NAVEGACIÓN ---
  irALista() {
    this.animalSeleccionadoExpediente = null;
    this.vistaActual = 'lista';
  }

  abrirExpediente(animal: any) {
    this.animalSeleccionadoExpediente = animal;
    this.vistaActual = 'expediente';
  }

  nuevoEventoDesdeExpediente() {
    this.modoEdicion = false;
    this.idEventoEditando = null;
    this.nuevoEvento = {
      tipo: 'Monta / Inseminación',
      fecha: new Date().toISOString().split('T')[0],
      animalId: this.animalSeleccionadoExpediente.id,
      areteSiniiga: this.animalSeleccionadoExpediente.areteSiniiga,
      nombreAnimal: this.animalSeleccionadoExpediente.nombreOpcional || ''
    };
    this.vistaActual = 'formulario';
  }

  editarEvento(evento: EventoReproduccion) {
    this.modoEdicion = true;
    this.idEventoEditando = evento.id || null;
    this.nuevoEvento = { ...evento };
    this.vistaActual = 'formulario';
  }

  async guardarEvento() {
    try {
      const eventoParaGuardar = { ...this.nuevoEvento } as EventoReproduccion;
      
      if (this.modoEdicion && this.idEventoEditando) {
        await this.reproduccionService.actualizarEvento(this.idEventoEditando, eventoParaGuardar);
      } else {
        await this.reproduccionService.agregarEvento(eventoParaGuardar);
      }
      this.vistaActual = 'expediente';
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    }
  }
}