import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';
import { Role } from '../models/role.model';
import { API_ENDPOINTS } from './api/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private endpoint = API_ENDPOINTS.ROLES;

  constructor(private apiService: ApiService) { }

  getRoles(): Observable<Role[]> {
    return this.apiService.get<{ status: boolean; roles: Role[] }>(`${this.endpoint}`)
      .pipe(
        map(response => response.roles) 
      );
  }
}
