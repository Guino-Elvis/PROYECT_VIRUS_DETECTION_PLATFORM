import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-only',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [hidden]="!isAdmin">
    <ng-content></ng-content>
  </div>
  `,
})
export class AdminOnlyComponent implements OnInit {
  isAdmin: boolean = false;
  @Output() adminStatus = new EventEmitter<boolean>();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getUserData().subscribe(user => {
      this.isAdmin = user?.roles?.some(role => role.name === 'Administrador') || false;
      this.adminStatus.emit(this.isAdmin); // ⬅️ Sin esto, el form no sabe tu rol
    });
  }
}
