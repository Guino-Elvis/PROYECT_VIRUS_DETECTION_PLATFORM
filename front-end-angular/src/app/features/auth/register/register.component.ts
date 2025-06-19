import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ Importar Router
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faArrowLeft, faGlobe, faPhone, faAddressBook, faBuildingWheat, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../../services/api.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: Omit<User, 'id' | 'token'> = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    //empresa
    ra_social: '',
    ruc: '',
    address: '',
    phone: ''
  };
  errorMessage = '';
  isLoading = false;
  passwordVisible = false;
  

  // Íconos de FontAwesome
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faArrowLeft = faArrowLeft;
  faGlobe = faGlobe;
  faPhone = faPhone;
  faAddressBook = faAddressBook;
  faBuildingWheat = faBuildingWheat;
  faHashtag = faHashtag

  constructor(private authService: AuthService, private router: Router, private apiService: ApiService) { }


  register() {
    if (this.user.password !== this.user.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
  
    this.isLoading = true;
    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Registro exitoso:', response);
        this.router.navigate(['/welcome']); 
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error en el registro. Inténtalo de nuevo.';
        console.error('❌ Error en registro:', error);
      }
    });
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
