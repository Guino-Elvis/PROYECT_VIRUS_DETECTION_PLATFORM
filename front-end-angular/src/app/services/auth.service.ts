import { Injectable } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { catchError, map } from 'rxjs/operators';
import { HotToastService } from '@ngxpert/hot-toast';
import { API_ENDPOINTS } from './api/api.endpoints';
import { shareReplay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private cachedUserData$?: Observable<User>; 

  constructor(private api: ApiService, private toast: HotToastService) {}

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.api.post<User>(API_ENDPOINTS.AUTH_LOGIN, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.toast.success('Inicio de sesión exitoso.');
           this.cachedUserData$ = undefined; // ← Limpiamos la caché para forzar recarga
        }
      }),
      catchError(error => {
        this.toast.error('Error al iniciar sesión. Verifica tus credenciales.');
        return throwError(() => new Error('Error en el inicio de sesión.'));
      })
    );
  }

  register(user: Omit<User, 'id' | 'token'>): Observable<User> {
    return this.api.post<User>(API_ENDPOINTS.AUTH_REGISTER, user).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
           this.cachedUserData$ = undefined; // ← Limpiamos la caché
        }
      }),
      catchError(error => {
        this.toast.error('Error al registrarse. Inténtalo de nuevo.');
        return throwError(() => new Error('Error en el registro.'));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH_LOGOUT, {}).pipe(
      tap(() => {
        localStorage.removeItem('token'); // Eliminar el token al hacer logout
        this.toast.success('Sesión cerrada correctamente.');
               this.cachedUserData$ = undefined; // ← Limpiamos la caché al hacer logout
      }),
      catchError(error => {
        this.toast.error('Error al cerrar sesión. Inténtalo de nuevo.');
        return throwError(() => new Error('Error al cerrar sesión.'));
      })
    );
  }
  
  // getUserData(): Observable<User> {
  //   return this.api.get<{ status: boolean; user: User }>(API_ENDPOINTS.AUTH_USER).pipe(
     
  //     map(response => response.user), // Extrae el objeto 'user'
  //     catchError((error) => {
  //       this.toast.error('Error al obtener los datos del usuario.');
  //       return throwError(() => new Error('Error al obtener los datos del usuario.'));
  //     })
  //   );
  // }

    getUserData(): Observable<User> {
    // Usamos la respuesta cacheada si existe
    if (!this.cachedUserData$) {
      this.cachedUserData$ = this.api.get<{ status: boolean; user: User }>(API_ENDPOINTS.AUTH_USER).pipe(
        map(response => response.user),
        tap(user => {
          if (user) {
            this.toast.success('Datos del usuario obtenidos correctamente.');
          } else {
            this.toast.error('No se encontraron datos del usuario.');
          }
        }),
        shareReplay(1),
        catchError(error => {
          this.toast.error('Error al obtener los datos del usuario.');
          this.cachedUserData$ = undefined; // ← Limpia la caché en caso de error
          return throwError(() => new Error('Error al obtener los datos del usuario.'));
        })
      );
    }

    return this.cachedUserData$;
  }
}
