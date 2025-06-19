import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-datepicker.component.html',
})
export class CustomDatepickerComponent {
  startDate: string | null = null;
  endDate: string | null = null;

  @Output() dateChange = new EventEmitter<{ startDate: string | null; endDate: string | null }>();

  emitDates() {
    this.dateChange.emit({ startDate: this.startDate, endDate: this.endDate });
  }

  reset() {
    this.startDate = null;
    this.endDate = null;
    this.emitDates(); // Notificar el cambio
  }
}
