import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reusable-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FontAwesomeModule],
  template: `
    <button mat-button [ngClass]="[variante, size]" (click)="onClick.emit()">
      <fa-icon *ngIf="icon" [icon]="icon" [size]="iconSize" ></fa-icon>
      <span  *ngIf="text" class="pl-1.5">{{ text }}</span>
    </button>
  `,
  styles: [`
    button {
      font-weight: semibold;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-transform: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Estilos para variantes */
    .contained {
      background-color: #0061A0 !important;
      color: white !important;
      border: none !important;
    }

    .outlined {
      border: 1px solid #CCCCCC !important;
      color: #233641 !important;
      background-color: transparent !important;
    }

  
    .xs { padding: 4px 8px; font-size: 12px; }
    .sm { padding: 6px 12px; font-size: 14px; }
    .md { padding: 8px 16px; font-size: 16px; }
    .lg { padding: 10px 20px; font-size: 18px; }
    .xl { padding: 12px 24px; font-size: 20px; }
  
  `]
})
export class ReusableButtonComponent {
  @Input() icon?: IconDefinition;
  @Input() text: string = 'Crear';
  @Input() iconSize: 'xs' | 'sm' | 'lg' | '2x' = 'sm';
  @Input() variante: 'contained' | 'outlined' = 'outlined';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Output() onClick = new EventEmitter<void>();
}
