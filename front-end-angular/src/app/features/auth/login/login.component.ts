import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importar FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule, FontAwesomeModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: User = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;
  passwordVisible = false;

  // Íconos de FontAwesome
  faEnvelope = faEnvelope;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

 

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.user).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/welcome']);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        console.error(err);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
