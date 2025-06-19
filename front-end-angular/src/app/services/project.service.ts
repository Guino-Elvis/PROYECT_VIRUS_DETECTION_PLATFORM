import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from './api/api.endpoints';
import { ApiService } from './api.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, Observable, tap } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  private endpoint = API_ENDPOINTS.PROJECTS;

  constructor(private apiService: ApiService, private toast: HotToastService) { }

  getProjects(
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
      tap(() => this.toast.success('Projects cargadas correctamente',{
        position: 'bottom-right',
      })),
      catchError((error) => {
        this.toast.error('Error al cargar Project',{
          position: 'bottom-right',
        });
        throw error;
      })
    );
  }

  getProject(id: number): Observable<Project> {
    return this.apiService.get<Project>(`${this.endpoint}/${id}`).pipe(
      tap(() => this.toast.success('Detalle de Project obtenida con éxito',{
        position: 'bottom-right',
      })),
    );
  }

  createProject(project: Project): Observable<Project> {
    return this.apiService.post<Project>(this.endpoint, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.apiService.put<Project>(this.endpoint, id, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id);
  }
}
