import { Component, HostListener, Input } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './layout.component.html',
  styles: ``
})
export class LayoutComponent {

  isCompact: boolean = true;
  isSidebarOpen: boolean = true;
  userData: User | null = null;
  
  @Input() title: string = 'dashboard';  // Agregar esta línea

  constructor(private authService: AuthService , private router: Router) { }

  ngOnInit(): void {
    this.fetchUserData();
    this.handleResize(); // Ajuste inicial del sidebar
  }

  toggleCompactMode(): void {
    this.isCompact = !this.isCompact;
  }

  fetchUserData(): void {
    if (!this.authService.isAuthenticated()) {
      this.userData = null;
      return;
    }

    this.authService.getUserData().subscribe({
      next: (user) => {
        // console.log('Usuario cargado:', user); // Depuración
        this.userData = user;
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario', error);
        this.userData = null;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada correctamente');
        localStorage.removeItem('token'); // Asegurar que el token se borre
        this.router.navigate(['/login']); // Redirigir al login
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
  
  @HostListener('window:resize', ['$event'])
  handleResize(): void {
    this.isSidebarOpen = window.innerWidth >= 640;
  }
}
