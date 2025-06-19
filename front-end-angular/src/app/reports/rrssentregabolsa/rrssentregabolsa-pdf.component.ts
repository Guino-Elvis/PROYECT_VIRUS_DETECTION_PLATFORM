import { Component } from '@angular/core';
import { RRSSEntregaBolsa } from '../../models/rrssentregabolsa.model';
import { AlertService } from '../../services/alert.service';
import { RRSSEntregaBolsaService } from '../../services/rrssentrega-bolsa.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rrssentregabolsa-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rrssentregabolsa-pdf.component.html',
  styles: ``
})
export class RrssentregabolsaPdfComponent {
  rrssentregabolsas: any[] = [];
  perPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;

  constructor(
    private rrssentregabolsaService: RRSSEntregaBolsaService,
  ) { }

  ngOnInit(): void {
    this.loadRRSSEntregaBolsas();
  }


  loadRRSSEntregaBolsas(): void {
    this.rrssentregabolsaService.ReportePDF(
      this.perPage,
      this.currentPage
    ).pipe(first()).subscribe({
      next: (response: { data: { [key: string]: any[] }, current_page: number, total_pages: number, total: number }) => {
        // Asignamos las propiedades de la paginación
        this.totalItems = response.total;
        this.totalPages = response.total_pages;

        // Convertimos las claves del objeto `data` (que son los institution_id) en un arreglo de objetos
        this.rrssentregabolsas = Object.keys(response.data).map(institutionId => {
          return {
            institutionId,
            institutionData: response.data[institutionId],
            institutionDetails: response.data[institutionId][0].institution  // Detalles de la institución (asumimos que todos los registros de una institución tienen los mismos detalles)
          };
        });
      },
      error: (error) => console.error('Error al obtener entregabolsas:', error),
    });
  }

  // Función para cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRRSSEntregaBolsas();  // Volver a cargar los datos para la nueva página
  }
}
