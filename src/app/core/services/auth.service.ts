import { Injectable, signal, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);

  constructor(
    private router: Router, 
    private auth: Auth,
    private ngZone: NgZone // <-- 1. Inyectamos NgZone
  ) {
    authState(this.auth).subscribe((user) => {
      // 2. Envolvemos la señal en la zona de Angular
      this.ngZone.run(() => {
        if (user) {
          this.isAuthenticated.set(true);
        } else {
          this.isAuthenticated.set(false);
        }
      });
    });
  }

  async login(correo: string, contrasena: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, correo, contrasena);
      
      // 1. Forzamos la señal a true ANTES de navegar para que el Guard nos deje pasar
      this.isAuthenticated.set(true); 

      // 2. Ahora sí, navegamos
      this.ngZone.run(() => {
        this.router.navigate(['/']); 
      });
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }

  async logout() {
    await signOut(this.auth);
    
    // Forzamos la señal a false ANTES de irnos
    this.isAuthenticated.set(false);
    
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }
}