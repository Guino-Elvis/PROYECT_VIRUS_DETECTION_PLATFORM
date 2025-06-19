import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINTS } from './api/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private baseUrl = API_ENDPOINTS.AUTH_REFRESH_TOKEN;

  constructor(private http: HttpClient) {}

   // Método para renovar el token
   refreshToken(): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<{ authorization: { token: string } }>(`${this.baseUrl}`, {}, { headers }).pipe(
      map(response => {
        const newToken = response.authorization.token;
        localStorage.setItem('token', newToken);
        return newToken;
      }),
      catchError(error => {
        console.error('Error al refrescar el token', error);
        this.handleSessionExpired();
        return throwError(() => new Error('No se pudo renovar el token.'));
      })
    );
  }

  // Alerta cuando la sesión expira
  private handleSessionExpired(): void {
    Swal.fire({
      title: 'Tu sesión ha expirado',
      text: '¿Deseas continuar navegando?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'No, cerrar sesión'
    }).then(result => {
      if (result.isConfirmed) {
        this.refreshToken().subscribe({
          next: newToken => console.log('Token renovado:', newToken),
          error: () => this.logout()
        });
      } else {
        this.logout();
      }
    });
  }

  // Cerrar sesión si el usuario no quiere renovar el token
  private logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
