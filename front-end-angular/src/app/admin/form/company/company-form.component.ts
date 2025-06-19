import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { API_ENDPOINTS } from '../../../services/api/api.endpoints';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './company-form.component.html',
  styles: ``
})
export class CompanyFormComponent {
  private baseUrl = API_ENDPOINTS.BASE_URL;
  @Input() company: any = null;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  companyForm: FormGroup;
  userId: number = 0;
  private userSubscription: Subscription = new Subscription();

  imagePreview: string | ArrayBuffer | null = null;

  statusOptions = [
    { id: '2', nombre: 'Activo' },
    { id: '1', nombre: 'Inactivo' },
  ];

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService
  ) {
    this.companyForm = this.fb.group({
      ra_social: ['', Validators.required],
      ruc: ['', Validators.required],
      address: ['', Validators.required],
      status: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      user_id: [this.userId, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      image: [null],
      image_url: [null],

    });
  }


  ngOnInit(): void {
    this.userSubscription = this.authService.getUserData().subscribe(
      (user) => {
     
        if (user && user.id !== undefined) {
          this.userId = user.id;
          this.companyForm.patchValue({
            user_id: this.userId
          });
        }
      },
      (error: any) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company'] && changes['company'].currentValue) {
      const updatedCompany = {
        ...this.company,
        status: Number(this.company.status),
      };
      this.companyForm.patchValue(updatedCompany);

      if (this.company.image_url) {
        this.imagePreview = `${this.baseUrl}${this.company.image_url}`;
      }
    }
  }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];


      // Actualizamos el FormGroup con la imagen
      this.companyForm.patchValue({
        image: file
      });

      // Opcional: Si necesitas previsualizar la imagen
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.companyForm.patchValue({ image_url: reader.result });
      };
    }
  }

  handleSubmit(): void {
    if (this.companyForm.invalid) {
      return;
    }
  
   
    this.companyForm.patchValue({ user_id: this.userId });
    // console.log("🚀 Enviando con user_id:", this.userId); 
  
    const formData = new FormData();
    Object.keys(this.companyForm.value).forEach((key) => {
      const value = this.companyForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    const image = this.companyForm.get('image')?.value;
    if (image) {
      formData.append('image', image);
    }
  
    this.onSave.emit(formData);
  }

}
