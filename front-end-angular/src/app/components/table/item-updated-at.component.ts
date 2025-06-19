import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { format } from 'date-fns';
import { ICONS } from '../../core/icons';

@Component({
  imports: [FontAwesomeModule],
  selector: 'app-item-updated-at',
  standalone: true,
  templateUrl: './item-updated-at.component.html', 
})
export class ItemUpdatedAtComponent {
  icons = ICONS;
  @Input() updated_at: string | null = null;

  formatDate(date: string | null, dateFormat: string): string {
    return date ? format(new Date(date), dateFormat) : '';
  }
}
