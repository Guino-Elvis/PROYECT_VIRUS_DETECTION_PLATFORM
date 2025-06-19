import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Project } from '../../../models/project.model';
import { ICONS } from '../../../core/icons';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-project-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './project-detalle.component.html',
  styles: ``
})
export class ProjectDetalleComponent {

  @Input() projectId!: number;
  project: Project | null = null;


  loading: boolean = true;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  icons = ICONS;
  isLoading: boolean = false;
  modalOpen: boolean = false;

  editMode: boolean = false;
  editId: number | null = null;
  modalOpenEdit: boolean = false;

  constructor(
    private projectService: ProjectService,

  ) {

  }

  ngOnInit(): void {
    console.log('ProjectDetalleComponent initialized with projectId:', this.projectId);
    if (this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  ngOnChanges(): void {
    if (this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  private loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
        console.log('Project loaded:', this.project);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar la project', err);
      }
    });
  }

  isExpired(date: string | null): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }



  cerrarDetalle(): void {
    this.onClose.emit();
  }
}
