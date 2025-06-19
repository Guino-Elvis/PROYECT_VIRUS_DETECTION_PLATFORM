import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ICONS } from '../../core/icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-modal-form',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './modal-form.component.html',
  styles: [`
    /* Animaciones para escala (zoom) */
    .scale-0 {
      transform: scale(0);
    }
    .scale-100 {
      transform: scale(1);
    }
  `]
})
export class ModalFormComponent implements OnChanges {
  icons = ICONS;
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Input() position?: 'center' | 'corner';
  animateOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        setTimeout(() => this.animateOpen = true, 10);
      } else {
        this.animateOpen = false;
      }
    }
  }

  closeModal() {
    this.animateOpen = false;
    setTimeout(() => this.onClose.emit(), 300);
  }

  handleClose(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
