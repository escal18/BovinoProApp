import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Animal } from '../models/animal.model'; 

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private firestore = inject(Firestore);
  
  // La colección (tabla) en Firebase se llamará 'animales'
  private animalesCollection = collection(this.firestore, 'animales');

  constructor() { }

  // 1. LEER: Obtiene todos los animales en tiempo real
  getAnimales(): Observable<Animal[]> {
    // idField: 'id' inyecta automáticamente el ID del documento de Firebase en la propiedad 'id' de tu interfaz
    return collectionData(this.animalesCollection, { idField: 'id' }) as Observable<Animal[]>;
  }

  // 2. CREAR: Guarda un nuevo animal (Omitimos el 'id' porque Firebase lo genera automáticamente)
  async agregarAnimal(animal: Omit<Animal, 'id'>) {
    return addDoc(this.animalesCollection, animal);
  }

  // 3. ACTUALIZAR: Modifica los datos de un animal existente
  async actualizarAnimal(id: string, datos: Partial<Animal>) {
    const docRef = doc(this.firestore, `animales/${id}`);
    return updateDoc(docRef, datos);
  }

  // 4. ELIMINAR: Borra un registro
  async eliminarAnimal(id: string) {
    const docRef = doc(this.firestore, `animales/${id}`);
    return deleteDoc(docRef);
  }
}