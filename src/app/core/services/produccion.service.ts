import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RegistroProduccion } from '../models/produccion.model';

@Injectable({
  providedIn: 'root'
})
export class ProduccionService {
  private firestore = inject(Firestore);
  private produccionCollection = collection(this.firestore, 'produccion');

  constructor() { }

  getTodosLosRegistros(): Observable<RegistroProduccion[]> {
    const q = query(this.produccionCollection, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<RegistroProduccion[]>;
  }

  async agregarRegistro(registro: RegistroProduccion) {
    return addDoc(this.produccionCollection, registro);
  }

  async actualizarRegistro(id: string, datos: Partial<RegistroProduccion>) {
    const docRef = doc(this.firestore, `produccion/${id}`);
    return updateDoc(docRef, datos);
  }

  async eliminarRegistro(id: string) {
    const docRef = doc(this.firestore, `produccion/${id}`);
    return deleteDoc(docRef);
  }
}