import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../partials/layout.component';
import { CustomLinkComponent } from '../../../components/custom-link.component';
import { ModalFormComponent } from '../../../components/modal/modal-form.component';
import { CustomDatepickerComponent } from '../../../components/custom-datepicker/custom-datepicker.component';
import { ReusableButtonComponent } from '../../../components/reusable-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ItemUpdatedAtComponent } from '../../../components/table/item-updated-at.component';
import { PaginationComponent } from '../../../components/table/pagination/pagination.component';
import { NoItemPageComponent } from '../../../components/no-item-page.component';
import { ICONS } from '../../../core/icons';
import { AdministrationUser } from '../../../models/administrationUser.model';
import { AlertService } from '../../../services/alert.service';
import { AdministrationUserService } from '../../../services/administration-user.service';
import { first } from 'rxjs';
import { AdministrationUserFormComponent } from '../../form/administration-user/administration-user-form.component';


@Component({
  selector: 'app-administration-user-list',
  imports: [
    FormsModule,
    CommonModule,
    LayoutComponent,
    CustomLinkComponent,
    AdministrationUserFormComponent,
    ModalFormComponent,
    CustomDatepickerComponent,
    ReusableButtonComponent,
    FontAwesomeModule,
    ItemUpdatedAtComponent,
    PaginationComponent,
    NoItemPageComponent
  ],
  templateUrl: './administration-user-list.component.html',
  styles: ``
})
export class AdministrationUserListComponent {
  @ViewChild(CustomDatepickerComponent) datepicker!: CustomDatepickerComponent;
  icons = ICONS;
  administrationUsers: AdministrationUser[] = [];
  searchText: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  sortOrder: 'asc' | 'desc' = 'desc';
  perPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  administrationUserForm: AdministrationUser = {
    id: 0,
    status: '',
    role: '',
    name: '',
    email: '',
    password: '',
    company_id: 0,

    created_at: null,
    updated_at: null
  };
  editMode: boolean = false;
  editId: number | null = null;
  modalOpen: boolean = false;

  constructor(
    private alertService: AlertService,
    private administrationUserService: AdministrationUserService
  ) { }
  ngOnInit() {
    this.loadAdministrationUsers();
  }
  loadAdministrationUsers() {
    this.administrationUserService.getAdministrationUsers(
      this.searchText,
      this.startDate,
      this.endDate,
      this.sortOrder,
      this.perPage,
      this.currentPage
    ).pipe(first()).subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.administrationUsers = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.perPage);
        } else {
          console.error('La respuesta no contiene un array de usuarios');
        }
      },
      error: (error) => console.error('Error al obtener usuarios:', error),
    });
  }

  filterAdministrationUsers() {
    if (this.searchText.trim().length < 3) {
      return;
    }
    this.loadAdministrationUsers();
  }

  updateDates(dates: { startDate: string | null, endDate: string | null }) {
    this.startDate = dates.startDate;
    this.endDate = dates.endDate;
    this.loadAdministrationUsers();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadAdministrationUsers();
  }

  resetFilters(): void {
    this.searchText = '';
    this.startDate = null;
    this.endDate = null;
    this.sortOrder = 'desc';
    this.perPage = 8;
    this.currentPage = 1;
    this.datepicker.reset();
    this.loadAdministrationUsers();
  }

  hasActiveFilters(): boolean {
    return this.searchText.trim().length > 0;
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAdministrationUsers();
    }
  }

  updateItemsPerPage(perPage: number): void {
    this.perPage = perPage;
    this.loadAdministrationUsers();
  
  }

  createAdministrationUser(): void {
    this.editMode = false;
    this.administrationUserForm = {
      id: 0,
      status: '',
      role: '',
      name: '',
      email: '',
      password: '',
      company_id: 0,

      created_at: null,
      updated_at: null
    };
    this.modalOpen = true;
  }

  editAdministrationUser(administrationUser: AdministrationUser): void {
    if (administrationUser.id !== undefined) {
      this.editMode = true;
      this.editId = administrationUser.id;
      this.administrationUserForm = { ...administrationUser };
      this.modalOpen = true;
    } else {
      console.error('El usuario no tiene un ID válido');
    }
  }

  saveAdministrationUser(administrationUserData: AdministrationUser): void {
    if (this.editMode && this.editId !== null) {

      this.administrationUserService.updateAdministrationUser(this.editId, administrationUserData).pipe(first()).subscribe({
        next: () => {
          this.loadAdministrationUsers();
          this.closeModal();
          this.alertService.showSuccess('Usuario actualizado correctamente');
        },
        error: (error) => {
          this.alertService.showError('Hubo un error al actualizar');
        },
      });
    } else {
      this.administrationUserService.createAdministrationUser(administrationUserData).pipe(first()).subscribe({
        next: () => {
          this.loadAdministrationUsers();
          this.closeModal();
          this.alertService.showSuccess('Usuario creado correctamente');
        },
        error: () => {
          this.alertService.showError('Hubo un error al crear');
        },
      });
    }
  }

  deleteAdministrationUser(id: number): void {
    this.alertService.confirmDelete().then((confirmed: boolean) => {
      if (confirmed) {
        this.administrationUserService.deleteAdministrationUser(id).pipe(first()).subscribe({
          next: () => {
            this.alertService.showSuccess('Usuario eliminado correctamente');
            this.administrationUsers = this.administrationUsers.filter(cat => cat.id !== id);
          },
          error: () => {
            this.alertService.showError('Hubo un error al eliminar');
          },
        });
      }
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.administrationUserForm = {
      id: 0,
      status: '',
      role: '',
      name: '',
      email: '',
      password: '',
      company_id: 0,

      created_at: null,
      updated_at: null
    };
    this.editMode = false;
    this.editId = null;
  }
  getRoleNames(administrationUser: AdministrationUser): string {
    return administrationUser.roles?.map(r => r.name).join(', ') || 'Sin roles';
  }
  
  getCompanyNames(administrationUser: AdministrationUser): string {
    return administrationUser.companies?.map(c => c.ra_social).join(', ') || 'Sin empresas';
  }
}
