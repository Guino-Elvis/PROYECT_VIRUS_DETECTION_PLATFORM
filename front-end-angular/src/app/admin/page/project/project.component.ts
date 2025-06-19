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
import { ProjectService } from '../../../services/project.service';
import { AlertService } from '../../../services/alert.service';
import { first } from 'rxjs';
import { ProjectFormComponent } from '../../form/project/project-form.component';
import { Project } from '../../../models/project.model';
import { ProjectDetalleComponent } from '../project-detalle/project-detalle.component';

@Component({
  selector: 'app-project',
  imports: [
    FormsModule,
    CommonModule,
    LayoutComponent,
    CustomLinkComponent,
    ProjectFormComponent,
    ModalFormComponent,
    CustomDatepickerComponent,
    ReusableButtonComponent,
    FontAwesomeModule,
    ItemUpdatedAtComponent,
    PaginationComponent,
    NoItemPageComponent,
    ProjectDetalleComponent
  ],
  templateUrl: './project.component.html',
  styles: ``
})
export class ProjectComponent {

  @ViewChild(CustomDatepickerComponent) datepicker!: CustomDatepickerComponent;
  @ViewChild(ProjectFormComponent) projectFormComponent!: ProjectFormComponent;

  icons = ICONS;
  projects: Project[] = [];
  searchText: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  sortOrder: 'asc' | 'desc' = 'desc';
  perPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  projectForm: Project = {
    id: 0,
    name: '',
    description: '',
    target_url: '',
    company_id: 0,
    created_at: '',
    updated_at: ''
  };
  editMode: boolean = false;
  editId: number | null = null;
  modalOpen: boolean = false;
  idProjectSeleccionada: number | null = null;
  comprimirItems: boolean = false;
  constructor(
    private projectService: ProjectService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects(
      this.searchText,
      this.startDate,
      this.endDate,
      this.sortOrder,
      this.perPage,
      this.currentPage

    ).pipe(first()).subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.projects = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.perPage);
        } else {
          console.error('La respuesta no contiene un array ');
        }
      },
      error: (error) => console.error('Error al obtener proyectos:', error),
    });
  }

  filterProjects(): void {
    if (this.searchText.trim().length < 3) {
      return;
    }
    this.loadProjects();
  }
  updateDates(dates: { startDate: string | null; endDate: string | null }) {
    this.startDate = dates.startDate;
    this.endDate = dates.endDate;
    this.loadProjects();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadProjects();
  }

  resetFilters(): void {
    this.searchText = '';
    this.startDate = null;
    this.endDate = null;
    this.sortOrder = 'desc';
    this.perPage = 8;
    this.currentPage = 1;
    this.datepicker.reset();
    this.loadProjects();
  }

  hasActiveFilters(): boolean {
    return this.searchText.trim().length > 0;
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProjects();
    }
  }
  updateItemsPerPage(perPage: number): void {
    this.perPage = perPage;
    this.loadProjects();
  }

  createProject(): void {
    this.editMode = false;
    this.resetForm();
    this.modalOpen = true;
  }


  editProject(project: Project): void {
    if (project.id !== undefined) {
      this.editMode = true;
      this.editId = project.id;
      this.projectForm = { ...project };
      this.modalOpen = true;
    } else {
      console.error('Error: El proyecto seleccionada no tiene un ID válido.');
    }
  }

  saveProject(projectData: Project): void {
    if (this.editMode && this.editId !== null) {
      // Modo edición
      this.alertService.showLoading('Guardando project...');

      this.projectService.updateProject(this.editId, projectData).pipe(first()).subscribe({
        next: () => {
          this.alertService.closeLoading();
          this.loadProjects();
          this.closeModal();
          this.alertService.showSuccess('project actualizada correctamente');
        },
        error: () => {
          this.alertService.closeLoading();
          this.alertService.showError('Error al actualizar proyecto');
        },
      });
    } else {
      this.alertService.showLoading('Guardando project...');
      // Modo creación
      this.projectService.createProject(projectData).pipe(first()).subscribe({
        next: () => {
          this.alertService.closeLoading();
          this.loadProjects();
          this.closeModal();
          this.alertService.showSuccess('project creada correctamente');
        },
        error: () => {
          this.alertService.closeLoading();
          this.alertService.showError('Error al crear proyecto');
        },
      });
    }
  }

  deleteProject(id: number): void {
    this.alertService.confirmDelete().then((confirmed: boolean) => {
      if (confirmed) {
        this.projectService.deleteProject(id).pipe(first()).subscribe({
          next: () => {
            this.alertService.showSuccess('project eliminada correctamente');
            this.projects = this.projects.filter(cat => cat.id !== id);
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
    this.projectForm = {
      id: 0,
      name: '',
      description: '',
      target_url: '',
      company_id: 0,
      created_at: '',
      updated_at: ''
    };
    if (this.projectFormComponent) {
      this.projectFormComponent.projectForm.reset(
        {
          id: 0,
          name: '',
          description: '',
          target_url: '',
          company_id: 0,
          created_at: '',
          updated_at: ''
        }
      );
    }
    this.editMode = false;
    this.editId = null;
  }

   detalleProject(id: number): void {
      this.idProjectSeleccionada = id;
      this.comprimirItems = true;
      console.info('paso a true');
    }
}
