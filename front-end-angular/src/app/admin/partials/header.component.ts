import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { User } from '../../models/user.model';
import { MenuLinksComponent } from './menu-links.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ICONS } from '../../core/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenuLinksComponent,FontAwesomeModule], 
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent {
  @Input() isSidebarOpen!: boolean;  
  @Input() userData!: User | null;
  @Input() title!: string;
  @Output() onLogout = new EventEmitter<void>();
 
  icons = ICONS; 
  isSubMenuOpen: boolean = false;
  isMenuOpen: boolean = false;
  isMenuOpen2: boolean = false;
  isSubMenuOpen2: boolean = false;
  anchorEl: any = null;

 constructor(private eRef: ElementRef) {}

  toggleSubMenu(): void {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }


  // ✅ Abrir/Cerrar Menú Usuario
  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) this.isMenuOpen2 = false; // Cierra el otro menú si está abierto
  }

  // ✅ Abrir/Cerrar Segundo Menú
  toggleUserMenu2(event: Event) {
    event.stopPropagation();
    this.isMenuOpen2 = !this.isMenuOpen2;
    if (this.isMenuOpen2) this.isMenuOpen = false; // Cierra el otro menú si está abierto
  }

  // ✅ Cierra ambos menús si se hace clic fuera de ellos
  @HostListener('document:click', ['$event'])
  closeMenus(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
      this.isMenuOpen2 = false;
    }
  }
  handleProfileClick(event: Event): void {
    this.anchorEl = event.currentTarget;
    this.isSubMenuOpen2 = true;
  }

  handleClose(): void {
    this.anchorEl = null;
    this.isSubMenuOpen2 = false;
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0].toUpperCase())
      .join('');
  }
}
