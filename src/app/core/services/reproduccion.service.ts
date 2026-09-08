import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { EventoReproduccion } from '../models/reproduccion.model';

@Injectable({
  providedIn: 'root'
})
export class ReproduccionService {
  private firestore = inject(Firestore);
  private reproduccionCollection = collection(this.firestore, 'eventos_reproduccion');

  constructor() { }

  getTodosLosEventos(): Observable<EventoReproduccion[]> {
    const q = query(this.reproduccionCollection, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<EventoReproduccion[]>;
  }

  async agregarEvento(evento: EventoReproduccion) {
    return addDoc(this.reproduccionCollection, evento);
  }

  async actualizarEvento(id: string, datos: Partial<EventoReproduccion>) {
    const docRef = doc(this.firestore, `eventos_reproduccion/${id}`);
    return updateDoc(docRef, datos);
  }

  async eliminarEvento(id: string) {
    const docRef = doc(this.firestore, `eventos_reproduccion/${id}`);
    return deleteDoc(docRef);
  }
}