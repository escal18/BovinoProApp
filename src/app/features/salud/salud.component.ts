import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoSalud, TipoEventoSalud } from '../../core/models/salud.model';

@Component({
  selector: 'app-salud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salud.component.html',
  styleUrls: ['./salud.component.css']
})
export class SaludComponent implements OnInit {

  vistaActual: 'lista' | 'formulario' = 'lista';

  // Filtros
  filtroBusqueda: string = '';
  filtroTipo: string = '';

  // Datos mock con tu estructura original
  listaEventosSalud: EventoSalud[] = [
    {
      id: '1',
      animalId: '01 2345 6789',
      nombreAnimal: 'La Pinta', // <-- Agregado
      tipo: 'Vacuna',
      fecha: new Date('2026-08-10'),
      diagnostico: 'Prevención anual de Brucelosis',
      tratamientoAplicado: 'Vacuna Cepas RB51',
      dosis: '5 ml',
      veterinarioEncargado: 'Dr. Roberto Gómez',
      proximaRevision: new Date('2027-08-10')
    },
    {
      id: '2',
      animalId: '01 9876 5432',
      nombreAnimal: 'Lucero', // <-- Agregado
      tipo: 'Enfermedad',
      fecha: new Date('2026-09-01'),
      diagnostico: 'Cuadro leve respiratorio',
      tratamientoAplicado: 'Oxitetraciclina L.A.',
      dosis: '20 ml',
      veterinarioEncargado: 'Dra. Sofía Martínez',
      proximaRevision: new Date('2026-09-05')
    },
    {
      id: '3',
      animalId: '01 4432 1122',
      nombreAnimal: 'Sultán', // <-- Agregado
      tipo: 'Desparasitante',
      fecha: new Date('2026-08-20'),
      diagnostico: 'Control rutinario de parásitos internos y externos',
      tratamientoAplicado: 'Ivermectina 1%',
      dosis: '15 ml',
      veterinarioEncargado: 'Dr. Roberto Gómez',
      proximaRevision: new Date('2026-11-20')
    }
  ];

  nuevoEvento: Partial<EventoSalud> = {
    tipo: 'Vacuna'
  };

  ngOnInit(): void {}

get eventosFiltrados(): EventoSalud[] {
    return this.listaEventosSalud.filter(evento => {
      const coincideBusqueda = evento.animalId.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                               (evento.nombreAnimal && evento.nombreAnimal.toLowerCase().includes(this.filtroBusqueda.toLowerCase())) ||
                               evento.tratamientoAplicado.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const coincideTipo = this.filtroTipo ? evento.tipo === this.filtroTipo : true;

      return coincideBusqueda && coincideTipo;
    });
  }

  cambiarVista(vista: 'lista' | 'formulario') {
    this.vistaActual = vista;
    if (vista === 'formulario') {
      this.nuevoEvento = { tipo: 'Vacuna', fecha: new Date() };
    }
  }

guardarEventoSalud() {
    const eventoCreado: EventoSalud = {
      id: (this.listaEventosSalud.length + 1).toString(),
      animalId: this.nuevoEvento.animalId || '01 0000 0000',
      nombreAnimal: this.nuevoEvento.nombreAnimal, // <-- Capturamos el nombre
      tipo: (this.nuevoEvento.tipo as TipoEventoSalud) || 'Vacuna',
      fecha: this.nuevoEvento.fecha ? new Date(this.nuevoEvento.fecha) : new Date(),
      diagnostico: this.nuevoEvento.diagnostico,
      tratamientoAplicado: this.nuevoEvento.tratamientoAplicado || 'Tratamiento general',
      dosis: this.nuevoEvento.dosis || 'N/D',
      veterinarioEncargado: this.nuevoEvento.veterinarioEncargado || 'Personal de Granja',
      proximaRevision: this.nuevoEvento.proximaRevision ? new Date(this.nuevoEvento.proximaRevision) : undefined
    };

    this.listaEventosSalud.unshift(eventoCreado);
    this.cambiarVista('lista');
  }
}