import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-items-per-page-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './items-per-page-filter.component.html',
  styleUrls: ['./items-per-page-filter.component.css']

})
export class ItemsPerPageFilterComponent {
  @Input() perPage: number = 10;          
  @Input() options: number[] = [1, 10, 25, 50, 100]; 
  
  @Output() perPageChange = new EventEmitter<number>();

  // Función para manejar el cambio de opción
  updateItemsPerPage(value: number) {
    this.perPageChange.emit(value);
  }
}
