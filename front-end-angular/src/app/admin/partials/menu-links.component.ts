import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../services/api/api.endpoints';

@Component({
  selector: 'app-menu-links',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-links.component.html',
  styles: ``
})
export class MenuLinksComponent implements OnInit {
  @Input() isCompact: boolean = false;
  links: any[] = [];
  currentPath: string = '';

  constructor(
    // private http: HttpClient, 
    private router: Router,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.currentPath = this.router.url;
    this.apiService.get<any>(API_ENDPOINTS.MENU_LINKS).subscribe({
      next: (data: any) => (this.links = data),
      error: (err) => console.error('Error loading menu JSON:', err)
    });
  }

  submenuPosition = { top: 0, left: 0 };

  toggleSubmenu(link: any, event: Event) {
    event.stopPropagation(); // Evita que el evento se propague al `document`
    link.showSubmenu = !link.showSubmenu;

    if (link.showSubmenu) {
      const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
      this.submenuPosition = {
        top: buttonRect.bottom + window.scrollY, // Posición debajo del botón
        left: buttonRect.left + window.scrollX // Alinear con el botón
      };
    }
  }

  @HostListener('document:click', ['$event'])
  closeSubmenu(event: Event) {
    this.links.forEach(link => link.showSubmenu = false);
  }
  getIcon(iconName: string, isActive: boolean): string {
    return `${iconName}${isActive ? '-fill' : ''} ${isActive ? 'text-white' : 'text-gray-600'}`;
  }
}
