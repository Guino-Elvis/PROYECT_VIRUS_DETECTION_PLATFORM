import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Project } from '../../../models/project.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminOnlyComponent } from '../../../components/admin-only.component';
import { Subscription } from 'rxjs';
import { Company } from '../../../models/company.model';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminOnlyComponent],
  templateUrl: './project-form.component.html',
  styles: ``
})
export class ProjectFormComponent {
  @Input() project: Project | null = null;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  isAdmin: boolean = false;

  projectForm: FormGroup;
  private companySubscription: Subscription = new Subscription();
  companyOptions: Company[] = [];

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService

  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      target_url: [null, Validators.required],
      company_id: [null],
    });
  }

  ngOnInit(): void {
    this.companySubscription = this.companyService.getCompanies().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.companyOptions = response;
        } else if (response?.data && Array.isArray(response.data)) {
          this.companyOptions = response.data;
        } else {
          console.error('Formato inesperado de compañias:', response);
        }
      },
      (error) => console.error('Error al obtener los compañias:', error)
    );
  }

  ngOnDestroy(): void {
    this.companySubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && changes['project'].currentValue) {
      const updatedProject = {
        ...this.project,
        company_id: changes['project'].currentValue.company?.id || null,
        //  company_id: this.project?.company?.id ?? null,
      };
      this.projectForm.patchValue(updatedProject);
    }
  }

  handleAdminStatus(admin: boolean) {
    this.isAdmin = admin;
  }

  handleSubmit(): void {
    console.log('isAdmin:', this.isAdmin);
    if (this.projectForm.invalid) {
      return;
    }

    let formData = { ...this.projectForm.value };

    if (!this.isAdmin) {
      delete formData.company_id;
    }

    console.info('Form Dataaaa:', formData);

    this.onSave.emit(formData);

    this.projectForm.reset();
  }

}
