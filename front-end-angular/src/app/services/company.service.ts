import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { API_ENDPOINTS } from './api/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private endpoint = API_ENDPOINTS.COMPANIES;

  constructor(private apiService: ApiService, private toast: HotToastService) { }

  getCompanies(
    search: string = '',
    startDate: string | null = null,
    endDate: string | null = null,
    sortOrder: 'asc' | 'desc' = 'desc',
    perPage: number = 10,
    page: number = 1
  ): Observable<any> {
    let params: string[] = [];

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
      tap(() => this.toast.success('Compañias cargadas correctamente',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al cargar compañias',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

  getCompany(id: number): Observable<Company> {
    return this.apiService.get<Company>(`${this.endpoint}/${id}`).pipe(
      tap(() => this.toast.success('Compañia obtenida con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al obtener la compañia',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }



  createCompany(companyData: FormData): Observable<Company> {

    return this.apiService.postFormData<Company>(`${this.endpoint}`, companyData);
  }

  updateCompany(id: number, companyData: FormData): Observable<Company> {
    companyData.append('_method', 'PUT');
    return this.apiService.postFormData<Company>(`${this.endpoint}/${id}`, companyData);
  }
  deleteCompany(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id).pipe(
      tap(() => this.toast.success('Compañia eliminada con éxito',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al eliminar la compañia',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

}
