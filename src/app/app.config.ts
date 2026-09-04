import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Importaciones de Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Importamos el archivo que acabas de crear
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Conectamos Angular con Firebase usando tus credenciales
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Activamos la Base de Datos
    provideFirestore(() => getFirestore()),
    // Activamos el Login
    provideAuth(() => getAuth())
  ]
};