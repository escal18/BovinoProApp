import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Animal,
  EstadoAnimal,
  GeneroAnimal,
} from '../../core/models/animal.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  // Control de vistas de la pantalla ('lista' | 'formulario' | 'detalle')
  vistaActual: 'lista' | 'formulario' | 'detalle' = 'lista';

  // Filtros de búsqueda
  filtroBusqueda: string = '';
  filtroEtapa: string = '';
  filtroEstado: string = '';

  // Animal seleccionado para ver detalles
  animalSeleccionado: Animal | null = null;

  // Propiedades nuevas para controlar la edición
  modoEdicion: boolean = false;
  idAnimalEditando: string | null = null;

  // Datos mock de ejemplo actualizados con etapa de desarrollo y raza Holstein
  listaAnimales: Animal[] = [
    {
      id: '1',
      areteSiniiga: '01 2345 6789',
      nombreOpcional: 'La Pinta',
      genero: 'Hembra',
      raza: 'Holstein',
      etapaDesarrollo: 'Productora',
      fechaNacimiento: new Date('2022-03-15'),
      pesoActualKg: 540,
      estado: 'Activo',
      loteUbicacion: 'Corral de Ordeña A',
      notas: 'Excelente producción lechera.',
    },
    {
      id: '2',
      areteSiniiga: '01 9876 5432',
      nombreOpcional: 'Lucero',
      genero: 'Hembra',
      raza: 'Holstein',
      etapaDesarrollo: 'Productora',
      fechaNacimiento: new Date('2021-08-10'),
      pesoActualKg: 610,
      estado: 'En Tratamiento',
      loteUbicacion: 'Lote B (Cuarentena)',
      notas: 'En observación por leve baja en consumo de alimento.',
    },
    {
      id: '3',
      areteSiniiga: '01 4432 1122',
      nombreOpcional: 'Sultán',
      genero: 'Macho',
      raza: 'Holstein',
      etapaDesarrollo: 'Semental',
      fechaNacimiento: new Date('2023-01-05'),
      pesoActualKg: 680,
      estado: 'Activo',
      loteUbicacion: 'Sementales',
      notas: 'Reproductor principal de la ganadería.',
    },
    {
      id: '4',
      areteSiniiga: '01 1122 3344',
      nombreOpcional: 'Copito',
      genero: 'Hembra',
      raza: 'Holstein',
      etapaDesarrollo: 'Ternera',
      fechaNacimiento: new Date('2026-01-10'),
      pesoActualKg: 95,
      estado: 'Activo',
      loteUbicacion: 'Área de Crianza',
      notas: 'Cría en desarrollo con excelente ganancia de peso.',
    },
  ];

  // Objeto temporal para el formulario de nuevo animal
  nuevoAnimal: Partial<Animal> = {
    genero: 'Hembra',
    estado: 'Activo',
  };

  ngOnInit(): void {}

  get animalesFiltrados(): Animal[] {
    return this.listaAnimales.filter((animal) => {
      const coincideBusqueda =
        animal.areteSiniiga
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        (animal.nombreOpcional &&
          animal.nombreOpcional
            .toLowerCase()
            .includes(this.filtroBusqueda.toLowerCase()));

      // Filtro por etapa de desarrollo/producción
      const coincideEtapa = this.filtroEtapa
        ? animal.etapaDesarrollo === this.filtroEtapa
        : true;
      const coincideEstado = this.filtroEstado
        ? animal.estado === this.filtroEstado
        : true;

      return coincideBusqueda && coincideEtapa && coincideEstado;
    });
  }

  cambiarVista(vista: 'lista' | 'formulario' | 'detalle', animal?: Animal) {
    this.vistaActual = vista;
    if (animal && vista === 'detalle') {
      this.animalSeleccionado = animal;
    } else if (animal && vista === 'formulario') {
      // Modo Edición: Cargamos los datos del animal al formulario
      this.modoEdicion = true;
      this.idAnimalEditando = animal.id;
      // Hacemos una copia para no alterar la tabla en tiempo real antes de guardar
      this.nuevoAnimal = { ...animal };
    } else if (vista === 'formulario') {
      // Modo Creación: Limpiamos el formulario
      this.modoEdicion = false;
      this.idAnimalEditando = null;
      this.nuevoAnimal = {
        genero: 'Hembra',
        estado: 'Activo',
        raza: 'Holstein',
      };
    }
  }

  guardarAnimal() {
    if (this.modoEdicion && this.idAnimalEditando) {
      // Lógica de Edición / Actualización
      const index = this.listaAnimales.findIndex(
        (a) => a.id === this.idAnimalEditando,
      );
      if (index !== -1) {
        this.listaAnimales[index] = {
          ...this.listaAnimales[index],
          ...this.nuevoAnimal,
          fechaNacimiento: this.nuevoAnimal.fechaNacimiento
            ? new Date(this.nuevoAnimal.fechaNacimiento)
            : this.listaAnimales[index].fechaNacimiento,
          pesoActualKg: Number(this.nuevoAnimal.pesoActualKg) || 0,
        } as Animal;
      }
    } else {
      // Lógica de Creación (la que ya tenías)
      const animalCreado: Animal = {
        id: (this.listaAnimales.length + 1).toString(),
        areteSiniiga: this.nuevoAnimal.areteSiniiga || '01 0000 0000',
        nombreOpcional: this.nuevoAnimal.nombreOpcional,
        genero: (this.nuevoAnimal.genero as GeneroAnimal) || 'Hembra',
        raza: this.nuevoAnimal.raza || 'Holstein',
        etapaDesarrollo: this.nuevoAnimal.etapaDesarrollo,
        fechaNacimiento: this.nuevoAnimal.fechaNacimiento
          ? new Date(this.nuevoAnimal.fechaNacimiento)
          : new Date(),
        pesoActualKg: Number(this.nuevoAnimal.pesoActualKg) || 0,
        estado: (this.nuevoAnimal.estado as EstadoAnimal) || 'Activo',
        loteUbicacion: this.nuevoAnimal.loteUbicacion || 'General',
        notas: this.nuevoAnimal.notas,
      };
      this.listaAnimales.unshift(animalCreado);
    }

    this.nuevoAnimal = { genero: 'Hembra', estado: 'Activo' };
    this.modoEdicion = false;
    this.idAnimalEditando = null;
    this.cambiarVista('lista');
  }
}
