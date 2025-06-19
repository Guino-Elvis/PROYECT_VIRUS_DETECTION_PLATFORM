import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  private loadingSwal: any;

  // Método para mostrar el loading
  showLoading(title: string = 'Cargando...', text: string = 'Por favor, espere.') {
    this.loadingSwal = Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Método para cerrar el loading
  closeLoading() {
    if (this.loadingSwal) {
      this.loadingSwal.close();
    }
  }
  
  confirmDelete(message: string = "¿Estás seguro de eliminar este elemento?"): Promise<boolean> {
    return Swal.fire({
      title: 'Confirmar eliminación',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed);
  }

  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }
}
