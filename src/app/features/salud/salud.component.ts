import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoSalud, TipoEventoSalud } from '../../core/models/salud.model';
import { SaludService } from '../../core/services/salud.service';
import { InventarioService } from '../../core/services/inventario.service';

@Component({
  selector: 'app-salud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salud.component.html',
  styleUrls: ['./salud.component.css']
})
export class SaludComponent implements OnInit {
  // Ahora tenemos 3 vistas
  vistaActual: 'lista' | 'expediente' | 'formulario' = 'lista';

  filtroBusqueda: string = '';
  cargando: boolean = true;

  listaEventosSalud: EventoSalud[] = [];
  animalesInventario: any[] = []; 
  animalesEnTratamiento: any[] = [];
  
  // Variables del Expediente actual
  animalSeleccionadoExpediente: any = null;

  // Variables del Formulario
  modoEdicion: boolean = false;
  idEventoEditando: string | null = null;
  nuevoEvento: Partial<EventoSalud> = {};
  estadoActualizado: string = '';

  constructor(
    private saludService: SaludService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    // 1. Escuchar eventos clínicos
    this.saludService.getTodosLosEventos().subscribe({
      next: (eventos) => {
        this.listaEventosSalud = eventos;
        this.cargando = false;
      }
    });

    // 2. Escuchar animales para el directorio y alertas
    this.inventarioService.getAnimales().subscribe({
      next: (animales) => {
        this.animalesInventario = animales;
        this.animalesEnTratamiento = animales.filter(a => a.estado === 'En Tratamiento');
      }
    });
  }

// Filtra y ORDENA los animales en la pantalla principal (Directorio)
  get expedientesFiltrados() {
    const ordenEtapas: { [key: string]: number } = {
      'Ternera': 1,
      'Becerra': 2,
      'Productora': 3,
      'Seca': 4,
      'Semental': 5
    };

    let filtrados = this.animalesInventario.filter(animal => {
      const coincideBusqueda = animal.areteSiniiga?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                               (animal.nombreOpcional && animal.nombreOpcional.toLowerCase().includes(this.filtroBusqueda.toLowerCase()));
      return coincideBusqueda;
    });

    return filtrados.sort((a, b) => {
      const etapaA = ordenEtapas[a.etapaDesarrollo || ''] || 99;
      const etapaB = ordenEtapas[b.etapaDesarrollo || ''] || 99;
      return etapaA - etapaB;
    });
  }

  // Filtra los eventos médicos SOLO para la vaca del expediente abierto
  get eventosDelExpediente(): EventoSalud[] {
    if (!this.animalSeleccionadoExpediente) return [];
    return this.listaEventosSalud.filter(e => e.animalId === this.animalSeleccionadoExpediente.id);
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
    this.estadoActualizado = this.animalSeleccionadoExpediente.estado; // Cargamos el estado actual

    this.nuevoEvento = {
      tipo: 'Enfermedad',
      fecha: new Date().toISOString().split('T')[0],
      animalId: this.animalSeleccionadoExpediente.id,
      areteSiniiga: this.animalSeleccionadoExpediente.areteSiniiga,
      nombreAnimal: this.animalSeleccionadoExpediente.nombreOpcional || ''
    };
    
    this.vistaActual = 'formulario';
  }

  editarEvento(evento: EventoSalud) {
    this.modoEdicion = true;
    this.idEventoEditando = evento.id || null;
    this.nuevoEvento = { ...evento };
    this.estadoActualizado = this.animalSeleccionadoExpediente.estado;
    
    this.vistaActual = 'formulario';
  }

  // --- ACCIÓN DE GUARDAR ---

  async guardarEventoSalud() {
    try {
      const eventoParaGuardar = { ...this.nuevoEvento } as EventoSalud;
      
      // 1. Guardar en Firebase
      if (this.modoEdicion && this.idEventoEditando) {
        await this.saludService.actualizarEvento(this.idEventoEditando, eventoParaGuardar);
      } else {
        await this.saludService.agregarEvento(eventoParaGuardar);
      }

      // 2. Actualizar estado del animal si cambió
      if (this.estadoActualizado && this.estadoActualizado !== this.animalSeleccionadoExpediente.estado) {
        await this.inventarioService.actualizarAnimal(
            this.animalSeleccionadoExpediente.id, 
            { estado: this.estadoActualizado as any }
        );
        // Actualizamos localmente para que se vea reflejado al instante al regresar al expediente
        this.animalSeleccionadoExpediente.estado = this.estadoActualizado; 
      }

      // 3. Regresar al expediente de esta vaca
      this.vistaActual = 'expediente';
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    }
  }
}