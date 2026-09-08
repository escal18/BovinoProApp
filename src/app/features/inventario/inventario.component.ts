import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animal } from '../../core/models/animal.model';
import { InventarioService } from '../../core/services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // Manejo de vistas y selección
  vistaActual: 'lista' | 'formulario' | 'detalle' = 'lista';
  modoEdicion: boolean = false;
  idAnimalEditando: string | null = null;
  animalSeleccionado: Animal | null = null;

  // Filtros de búsqueda
  filtroBusqueda: string = '';
  filtroEtapa: string = '';
  filtroEstado: string = '';
  
  // Estado de carga y datos
  cargando: boolean = true;
  listaAnimales: Animal[] = [];

  // Objeto temporal para el formulario
  nuevoAnimal: Partial<Animal> = {
    genero: 'Hembra',
    estado: 'Activo',
    etapaDesarrollo: 'Becerra'
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    // Escucha en tiempo real los cambios desde la base de datos de Firebase
    this.inventarioService.getAnimales().subscribe({
      next: (animales) => {
        this.listaAnimales = animales;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar el inventario:', error);
        this.cargando = false;
      }
    });
  }

  // Lógica de filtrado para la tabla
  get animalesFiltrados() {
    // 1. Definimos el orden lógico de las etapas
    const ordenEtapas: { [key: string]: number } = {
      'Ternera': 1,
      'Becerra': 2,
      'Productora': 3,
      'Seca': 4,
      'Semental': 5
    };

    // 2. Filtramos la lista como lo hacíamos normalmente
    let filtrados = this.listaAnimales.filter(animal => {
      const coincideBusqueda = animal.areteSiniiga?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                               (animal.nombreOpcional && animal.nombreOpcional.toLowerCase().includes(this.filtroBusqueda.toLowerCase()));
      const coincideEtapa = this.filtroEtapa ? animal.etapaDesarrollo === this.filtroEtapa : true;
      const coincideEstado = this.filtroEstado ? animal.estado === this.filtroEstado : true;

      return coincideBusqueda && coincideEtapa && coincideEstado;
    });

    // 3. Ordenamos usando nuestra jerarquía
    return filtrados.sort((a, b) => {
      const etapaA = ordenEtapas[a.etapaDesarrollo || ''] || 99; // 99 si no tiene etapa asignada
      const etapaB = ordenEtapas[b.etapaDesarrollo || ''] || 99;
      return etapaA - etapaB;
    });
  }

  // Obtenemos solo las hembras que ya están en etapa reproductiva
  get posiblesMadres() {
    return this.listaAnimales.filter(animal => 
      animal.genero === 'Hembra' && 
      (animal.etapaDesarrollo === 'Productora' || animal.etapaDesarrollo === 'Seca')
    );
  }

  // Controlador de navegación entre vistas (Lista, Formulario, Detalle)
  cambiarVista(vista: 'lista' | 'formulario' | 'detalle', animal?: Animal) {
    this.vistaActual = vista;
    
    if (vista === 'formulario') {
      if (animal) {
        // Modo Edición: Cargamos los datos del animal seleccionado
        this.modoEdicion = true;
        this.idAnimalEditando = animal.id;
        this.nuevoAnimal = { ...animal };
      } else {
        // Nuevo Registro: Limpiamos el formulario con valores por defecto
        this.modoEdicion = false;
        this.idAnimalEditando = null;
        this.nuevoAnimal = { 
          genero: 'Hembra', 
          estado: 'Activo', 
          etapaDesarrollo: 'Becerra',
          pesoActualKg: 0 
        };
      }
    } else if (vista === 'detalle' && animal) {
      this.animalSeleccionado = animal;
    }
  }

  // Guardar o Actualizar en Firebase Firestore
  async guardarAnimal() {
    try {
      if (this.modoEdicion && this.idAnimalEditando) {
        await this.inventarioService.actualizarAnimal(this.idAnimalEditando, this.nuevoAnimal);
      } else {
        const animalParaGuardar = { ...this.nuevoAnimal };
        delete animalParaGuardar.id; // Firebase genera el ID automáticamente
        
        await this.inventarioService.agregarAnimal(animalParaGuardar as Omit<Animal, 'id'>);
      }
      this.cambiarVista('lista');
    } catch (error) {
      console.error('Error al guardar el animal:', error);
      alert('Hubo un error al guardar en la base de datos.');
    }
  }

  // Eliminar un registro de Firestore
  async eliminarAnimal(id: string) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este registro del inventario?');
    if (confirmar) {
      try {
        await this.inventarioService.eliminarAnimal(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }
}