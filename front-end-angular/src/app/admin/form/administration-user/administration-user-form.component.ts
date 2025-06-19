import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { CompanyService } from '../../../services/company.service';
import { RoleService } from '../../../services/role.service';
import { Role } from '../../../models/role.model';
import { Company } from '../../../models/company.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-administration-user-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './administration-user-form.component.html',
  styles: ``
})
export class AdministrationUserFormComponent {
  @Input() administrationUser: any = null;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  administrationUserForm: FormGroup;
  companyId: number = 0;
  private companySubscription: Subscription = new Subscription();
  private roleSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  statusOptions = [
    { id: '2', nombre: 'Activo' },
    { id: '1', nombre: 'Inactivo' },
  ];

  roleOptions: Role[] = [];
  companyOptions: Company[] = [];  
  userData: User | null = null;
  isAdmin: boolean = false;
  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private companyService: CompanyService,
    public apiService: ApiService,
    private authService: AuthService,
  ) {
    this.administrationUserForm = this.fb.group({
      role: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required]],
      password: [''], 
      status: ['', Validators.required],
      company_id: [null], // Ahora es obligatorio seleccionar una empresa
    });
  }

  ngOnInit(): void {
    this.companySubscription = this.companyService.getCompanies().subscribe(
      (response) => {
        this.companyOptions = response?.data || [];
      },
      (error) => console.error('Error al obtener las empresas:', error)
    );

    this.roleSubscription = this.roleService.getRoles().subscribe(
      (roles) => this.roleOptions = roles,
      (error) => console.error('Error al obtener los roles:', error)
    );

    this.userSubscription = this.authService.getUserData().subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.userData = response;
          this.isAdmin = this.userData.roles?.some(role => role.name === 'Administrador') || false;
        } else {
          console.error('Formato inesperado de usuario:', response);
        }
      },
      (error) => console.error('Error al obtener los datos del usuario:', error)
    );
  }

  ngOnDestroy(): void {
    this.companySubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['administrationUser']) {
      const userData = changes['administrationUser'].currentValue;
  
      if (!userData) {
        this.administrationUserForm.reset({
          role: '',
          name: '',
          email: '',
          password: '',
          status: '1', 
          company_id: null
        });
      } else {
        console.log('Datos recibidos para edición:', userData);
  
        const selectedRole = userData.roles?.length ? userData.roles[0].name : null;
        const selectedCompany = userData.companies?.length ? userData.companies[0].id : null;
  
        this.administrationUserForm.patchValue({
          name: userData.name || '',
          email: userData.email || '',
          password: '',
          status: userData.status !== null && userData.status !== undefined ? String(userData.status) : '1',
          company_id: selectedCompany || null,
          role: selectedRole || null,
        });
  
        console.log('Formulario actualizado:', this.administrationUserForm.value);
      }
    }
  }
 

  handleSubmit(): void {
    if (this.administrationUserForm.invalid) {
      return;
    }
  
    let formData = this.administrationUserForm.value;
    if (!this.isAdmin) {
      delete formData.company_id;
    }
  
    if (!formData.password) {
      delete formData.password;
    }
  
    this.onSave.emit(formData);
    this.administrationUserForm.reset();
  }
}
