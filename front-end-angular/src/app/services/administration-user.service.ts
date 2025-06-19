import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, Observable, tap } from 'rxjs';
import { AdministrationUser } from '../models/administrationUser.model';
import { API_ENDPOINTS } from './api/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class AdministrationUserService {
  private endpoint = API_ENDPOINTS.ADMINISTRATION_USERS;
  constructor(private apiService: ApiService, private toast: HotToastService) { }

  getAdministrationUsers(
    search: string = '',
    startDate: string | null = null,
    endDate: string | null = null,
    sortOrder: 'asc' | 'desc' = 'desc',
    perPage: number = 10,
    page: number = 1
  ): Observable<any> {
    const params: string[] = [];

    if (search.trim()) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    params.push(`sort_order=${sortOrder}`);
    params.push(`per_page=${perPage}`);
    params.push(`page=${page}`);

    const queryString = params.length ? `?${params.join('&')}` : '';
    const url = `${this.endpoint}${queryString}`;

    return this.apiService.get(url).pipe(
      tap(() => this.toast.success('Usuarios obtenidos con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al obtener los usuarios',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }


  // getCategoria(id: number): Observable<AdministrationUser> {
  //   return this.apiService.get<AdministrationUser>(`${this.endpoint}/${id}`).pipe(
  //     tap(() => this.toast.success('Usuario obtenido con éxito')),
  //     catchError((error) => {
  //       this.toast.error('Error al obtener el usuario');
  //       throw error;
  //     })
  //   );
  // }

  createAdministrationUser(administrationUser: AdministrationUser): Observable<AdministrationUser> {
    return this.apiService.post<AdministrationUser>(this.endpoint, administrationUser).pipe(
      tap(() => this.toast.success('Usuario creado con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al crear el usuario',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

  updateAdministrationUser(id: number, administrationUser: AdministrationUser): Observable<AdministrationUser> {
    return this.apiService.put<AdministrationUser>(this.endpoint,id, administrationUser).pipe(
      tap(() => this.toast.success('Usuario actualizado con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al actualizar el usuario',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

  deleteAdministrationUser(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id).pipe(
      tap(() => this.toast.success('Usuario eliminado con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al eliminar el usuario',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

}
