import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario: string = ''; // Ojo: Aquí ahora deberás escribir el CORREO que registraste
  contrasena: string = '';
  mensajeError: string = '';
  cargando: boolean = false; // Agregamos esto para saber si está cargando

  constructor(private authService: AuthService) {}

  async iniciarSesion() {
    if (!this.usuario || !this.contrasena) {
      this.mensajeError = 'Por favor, ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // Esperamos la respuesta de Firebase
    const exito = await this.authService.login(this.usuario, this.contrasena);
    
    if (!exito) {
      this.mensajeError = 'Correo o contraseña incorrectos. Intenta nuevamente.';
    }
    
    this.cargando = false;
  }
}