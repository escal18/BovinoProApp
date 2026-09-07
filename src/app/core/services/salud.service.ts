import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { EventoSalud } from '../models/salud.model';

@Injectable({
  providedIn: 'root'
})
export class SaludService {
  private firestore = inject(Firestore);
  
  // Nombre de la tabla en Firebase
  private saludCollection = collection(this.firestore, 'eventos_salud');

  constructor() { }

  // 1. Obtiene TODOS los eventos, ordenados del más reciente al más antiguo
  getTodosLosEventos(): Observable<EventoSalud[]> {
    const q = query(this.saludCollection, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<EventoSalud[]>;
  }

  // 2. Obtiene eventos de UN ANIMAL específico
  getEventosPorAnimal(animalId: string): Observable<EventoSalud[]> {
    const q = query(
      this.saludCollection, 
      where('animalId', '==', animalId), 
      orderBy('fecha', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<EventoSalud[]>;
  }

  // 3. Registrar un nuevo evento de salud
  async agregarEvento(evento: EventoSalud) {
    return addDoc(this.saludCollection, evento);
  }

  // 4. Actualizar un registro médico
  async actualizarEvento(id: string, datos: Partial<EventoSalud>) {
    const docRef = doc(this.firestore, `eventos_salud/${id}`);
    return updateDoc(docRef, datos);
  }

  // 5. Eliminar un registro médico
  async eliminarEvento(id: string) {
    const docRef = doc(this.firestore, `eventos_salud/${id}`);
    return deleteDoc(docRef);
  }
}