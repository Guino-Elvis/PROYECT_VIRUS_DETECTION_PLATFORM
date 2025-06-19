import { Component } from '@angular/core';
import { LayoutComponent } from '../../admin/partials/layout.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [LayoutComponent], // Asegúrate de importar LayoutComponent
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'] // Aquí estaba mal escrito
})
export class WelcomeComponent {}
