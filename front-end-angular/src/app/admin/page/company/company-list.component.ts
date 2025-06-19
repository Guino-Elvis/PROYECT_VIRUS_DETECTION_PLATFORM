import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { first, Observable, pipe } from 'rxjs'; // Importar first() de RxJS
import { LayoutComponent } from '../../partials/layout.component';
import { CustomLinkComponent } from '../../../components/custom-link.component';
import { ModalFormComponent } from '../../../components/modal/modal-form.component';
import { AlertService } from '../../../services/alert.service';
import { CustomDatepickerComponent } from '../../../components/custom-datepicker/custom-datepicker.component';
import { ReusableButtonComponent } from '../../../components/reusable-button.component';
import { ICONS } from '../../../core/icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ItemUpdatedAtComponent } from '../../../components/table/item-updated-at.component';
import { PaginationComponent } from '../../../components/table/pagination/pagination.component';
import { NoItemPageComponent } from '../../../components/no-item-page.component';
import { CommonModule } from '@angular/common';
import { CompanyFormComponent } from '../../form/company/company-form.component';
import { CompanyService } from '../../../services/company.service';
import { Company } from '../../../models/company.model';
import { AdminOnlyComponent } from '../../../components/admin-only.component';
import { API_ENDPOINTS } from '../../../services/api/api.endpoints';

@Component({
  selector: 'app-company-list',
  imports: [
    FormsModule,
    CommonModule,
    LayoutComponent,
    CustomLinkComponent,
    CompanyFormComponent,
    ModalFormComponent,
    CustomDatepickerComponent,
    ReusableButtonComponent,
    FontAwesomeModule,
    ItemUpdatedAtComponent,
    PaginationComponent,
    NoItemPageComponent,
    AdminOnlyComponent
  ],
  templateUrl: './company-list.component.html',
  styles: ``
})
export class CompanyListComponent {
  public baseUrl = API_ENDPOINTS.BASE_URL;
  @ViewChild(CustomDatepickerComponent) datepicker!: CustomDatepickerComponent;
  @ViewChild(CompanyFormComponent) companyFormComponent!: CompanyFormComponent;

  icons = ICONS;
  companies: Company[] = [];
  searchText: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  sortOrder: 'asc' | 'desc' = 'desc';
  perPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  companyForm: Company = { id: 0, ra_social: '', ruc: '', address: '', status: '', phone: '', user_id: 0, email: '', image: null, image_url: null, created_at: null, updated_at: null };
  editMode: boolean = false;
  editId: number | null = null;
  modalOpen: boolean = false;


  constructor(
    private companyService: CompanyService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanies(
      this.searchText,
      this.startDate,
      this.endDate,
      this.sortOrder,
      this.perPage,
      this.currentPage

    ).pipe(first()).subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.companies = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.perPage);
        } else {
          console.error('La respuesta no contiene un array de compañias');
        }
      },
      error: (error) => console.error('Error al obtener compañias:', error),
    });
  }

  filterCompanies(): void {
    if (this.searchText.trim().length < 3) {
      return;
    }
    this.loadCompanies();
  }

  updateDates(dates: { startDate: string | null; endDate: string | null }) {
    this.startDate = dates.startDate;
    this.endDate = dates.endDate;
    this.loadCompanies();
  }


  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadCompanies();
  }

  resetFilters(): void {
    this.searchText = '';
    this.startDate = null;
    this.endDate = null;
    this.sortOrder = 'desc';
    this.perPage = 8;
    this.currentPage = 1;
    this.datepicker.reset();
    this.loadCompanies();
  }

  hasActiveFilters(): boolean {
    return this.searchText.trim().length > 0;
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCompanies();
    }
  }
  updateItemsPerPage(perPage: number): void {
    this.perPage = perPage;
    this.loadCompanies();
  }

  createCompany(): void {
    this.editMode = false;
    this.resetForm();
    this.modalOpen = true;
  }

  editCompany(company: Company): void {
    if (company.id !== undefined) {
      this.editMode = true;
      this.editId = company.id;
      this.companyForm = { ...company };
      this.modalOpen = true;
    } else {
      console.error('No se puede editar la compañia no tiene un ID válido :', company);
    }
  }


  saveCompany(formData: FormData): void {
    if (this.editMode && this.editId !== null) {
      this.companyService.updateCompany(this.editId, formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.loadCompanies();
            this.closeModal();
            this.alertService.showSuccess('Compañía actualizada correctamente');
          },
          error: () => {
            this.alertService.showError('Error al actualizar la compañía');
          }
        });
    } else {
      this.companyService.createCompany(formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.loadCompanies();
            this.closeModal();
            this.alertService.showSuccess('Compañía creada correctamente');
          },
          error: () => {
            this.alertService.showError('Error al crear la compañía');
          }
        });
    }
  }



  deleteCompany(id: number): void {
    this.alertService.confirmDelete().then((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.deleteCompany(id).pipe(first()).subscribe({
          next: () => {
            this.alertService.showSuccess('Categoría eliminada correctamente');
            this.companies = this.companies.filter(cat => cat.id !== id);
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
    // Resetear el formulario en el componente padre
    this.companyForm = { id: 0, ra_social: '', ruc: '', address: '', status: '', phone: '', user_id: 0, email: '', image: null, image_url: null, created_at: null, updated_at: null };
    this.editMode = false;
    this.editId = null;

    // Después, aseguramos que el formulario del componente hijo también se actualice
    if (this.companyFormComponent) {
      this.companyFormComponent.companyForm.reset({
        id: 0,
        ra_social: '',
        ruc: '',
        address: '',
        status: '',
        phone: '',
        user_id: 0,
        email: '',
        image: null,
        image_url: null,
        created_at: null,
        updated_at: null
      });
    }
  }



}