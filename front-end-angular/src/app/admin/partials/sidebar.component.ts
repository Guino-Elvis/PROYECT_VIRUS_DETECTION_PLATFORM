import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuLinksComponent } from './menu-links.component';
import { User } from '../../models/user.model';
import { AdministrationUser } from '../../models/administrationUser.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuLinksComponent],
  templateUrl: './sidebar.component.html',
  styles: ``
})
export class SidebarComponent {
  @Input() isCompact!: boolean;
  @Input() isSidebarOpen!: boolean;
  @Input() userData!: User | null;
  @Output() onLogout = new EventEmitter<void>(); // Emitir evento
  @Output() toggleCompact = new EventEmitter<void>();

  getInitials(name?: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0].toUpperCase())
      .join('');
  }

  getRoleNames(user?: User | null): string {
    return user?.roles?.map(r => r.name).join(', ') || 'Sin roles';
  }
  
  getCompanyNames(user?: User | null): string {
    return user?.companies?.map(c => c.ra_social).join(', ') || 'Sin empresas';
  }

}
