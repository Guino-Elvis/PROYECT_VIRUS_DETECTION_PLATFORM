import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONS } from '../../../core/icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
   icons = ICONS; 
  @Input() currentPage: number = 1;    
  @Input() totalPages: number = 1;   
  @Output() pageChange = new EventEmitter<number>(); 

  pages: (number | string)[] = [];

  ngOnInit() {
    this.generatePageNumbers();
  }

  // Generar los números de página para mostrar
  generatePageNumbers() {
    const maxVisiblePages = 6;
    this.pages = [];

    if (this.totalPages <= maxVisiblePages) {
      // Si el total de páginas es menor o igual a 6, mostrar todas las páginas
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      // Si hay más de 6 páginas, mostrar la primera, la última y la página actual con puntos intermedios
      const leftLimit = Math.max(1, this.currentPage - 2);
      const rightLimit = Math.min(this.totalPages, this.currentPage + 2);

      if (leftLimit > 1) {
        this.pages.push(1);  // Primera página
        if (leftLimit > 2) this.pages.push('...'); // Puntos suspensivos
      }

      for (let i = leftLimit; i <= rightLimit; i++) {
        this.pages.push(i);
      }

      if (rightLimit < this.totalPages) {
        if (rightLimit < this.totalPages - 1) this.pages.push('...'); // Puntos suspensivos
        this.pages.push(this.totalPages);  // Última página
      }
    }
  }

  changePage(page: number | string) {
    if (typeof page === 'number') {
      if (page >= 1 && page <= this.totalPages) {
        this.pageChange.emit(page);
        this.currentPage = page;
        this.generatePageNumbers();
      }
    }
  }
}
