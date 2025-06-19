import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { ErrorResponse } from '../models/error-response.model';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private toast: HotToastService
  ) { }

  private getAuthHeaders(isFormData: boolean = false): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return { headers };
  }

  // get<T>(endpoint: string, options?: any): Observable<T> {
  //   return this.http.get<T>(endpoint, {
  //     headers: this.getAuthHeaders().headers,
  //     responseType: options?.responseType || 'json'
  //   }).pipe(
  //     catchError(error => this.handleApiError(error))
  //   );
  // }

  get<T>(endpoint: string, options: any = {}): Observable<any> {
    const headers = this.getAuthHeaders().headers;

    return this.http.get(endpoint, {
      headers,
      ...options
    }).pipe(
      catchError(error => this.handleApiError(error))
    );
  }


  postFormData<T>(endpoint: string, data: FormData, id?: number): Observable<T> {
    const url = id ? `${endpoint}/${id}` : endpoint;
    return this.http.post<T>(url, data, this.getAuthHeaders(true)).pipe(
      catchError(error => this.handleApiError(error))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(endpoint, data, this.getAuthHeaders()).pipe(
      catchError(error => this.handleApiError(error))
    );
  }

  put<T>(endpoint: string, id: number | string, data: any): Observable<T> {
    return this.http.put<T>(`${endpoint}/${id}`, data, this.getAuthHeaders()).pipe(
      catchError(error => this.handleApiError(error))
    );
  }



  patch<T>(endpoint: string, data: any, id: number | string, id2?: number | string ): Observable<T> {
    const url = id2 ? `${endpoint}/${id}/${id2}` : `${endpoint}/${id}`;
    return this.http.patch<T>(url, data, this.getAuthHeaders()).pipe(
      catchError(error => this.handleApiError(error))
    );
  }

  // delete<T>(endpoint: string, id: number | string): Observable<T> {
  //   return this.http.delete<T>(`${endpoint}/${id}`, this.getAuthHeaders()).pipe(
  //     catchError(error => this.handleApiError(error))
  //   );
  // }

  delete<T>(endpoint: string, id: number | string, id2?: number | string): Observable<T> {
    const url = id2 ? `${endpoint}/${id}/${id2}` : `${endpoint}/${id}`;
    return this.http.delete<T>(url, this.getAuthHeaders()).pipe(
      catchError(error => this.handleApiError(error))
    );
  }

  private handleApiError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en la API:', error);

    if (error.status === 401) {
      return this.handleUnauthorizedError();
    }

    const errorResponse = this.buildErrorResponse(error);
    this.showErrorNotification(errorResponse.message);
    return throwError(() => errorResponse);
  }

  private handleUnauthorizedError(): Observable<never> {
    return this.tokenService.refreshToken().pipe(
      switchMap((newToken: string) => {
        return throwError(() => ({
          message: 'Token refreshed, retry original request',
          statusCode: 401,
          shouldRetry: true
        }));
      }),
      catchError((refreshError) => {
        // El refresh falló, redirigir a login
        this.redirectToLogin();
        const errorResponse: ErrorResponse = {
          message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.',
          statusCode: 401
        };
        this.showErrorNotification(errorResponse.message);
        return throwError(() => errorResponse);
      })
    );
  }

  private buildErrorResponse(error: HttpErrorResponse): ErrorResponse {
    const message = error.error?.message || error.message || 'Ocurrió un error inesperado';
    return {
      message: message,
      statusCode: error.status,
      // Puedes incluir aquí cualquier otro campo relevante del error
      ...(error.error && typeof error.error === 'object' ? error.error : {})
    };
  }

  private showErrorNotification(message: string): void {
    this.toast.error(message, {
      position: 'bottom-right',
    });
  }

  private redirectToLogin(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}