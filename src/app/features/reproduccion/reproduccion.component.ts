import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoReproduccion, TipoEventoReproduccion } from '../../core/models/reproduccion.model';
import { ReproduccionService } from '../../core/services/reproduccion.service';
import { InventarioService } from '../../core/services/inventario.service';

@Component({
  selector: 'app-reproduccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reproduccion.component.html',
  styleUrls: ['./reproduccion.component.css']
})
export class ReproduccionComponent implements OnInit {
  vistaActual: 'lista' | 'expediente' | 'formulario' = 'lista';
  filtroBusqueda: string = '';
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

  ngOnInit(): void {
    this.reproduccionService.getTodosLosEventos().subscribe({
      next: (eventos) => {
        this.listaEventos = eventos;
        this.cargando = false;
      }
    });

    this.inventarioService.getAnimales().subscribe({
      next: (animales) => {
        // FILTRO ESTRELLA: Solo guardamos las Hembras para este módulo
        this.hembrasInventario = animales.filter(a => a.genero === 'Hembra');
      }
    });
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
      return (animal.areteSiniiga?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
              (animal.nombreOpcional && animal.nombreOpcional.toLowerCase().includes(this.filtroBusqueda.toLowerCase())));
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