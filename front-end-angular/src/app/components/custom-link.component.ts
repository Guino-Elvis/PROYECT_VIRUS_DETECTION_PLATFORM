import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-link',
  template: `
    <div class="flex gap-2 bg-white px-3 py-3 rounded-sm font-medium text-xs uppercase overflow-x-auto border-l-4 border-[#0061A0]">
      <div class="flex justify-center items-center gap-1">
        <i class="ph-house text-[#283943] text-lg"></i>
        <div class="text-gray-500">Sistema</div>
      </div>
      <samp>/</samp>
      <div class="flex justify-center items-center gap-1">
        <i class="ph-database text-[#283943] text-lg"></i>
        <div class="text-gray-500">CRUD</div>
      </div>
      <samp>/</samp>
      <div class="flex justify-center items-center gap-1">
        <i [class]="iconClass " ></i>
        <div class="text-gray-500">{{ texto }}</div>
      </div>
    </div>
  `,
})
export class CustomLinkComponent {
  @Input() icon: string = 'ph-file-text';
  @Input() texto: string = 'Beneficios';

  get iconClass() {
    return `${this.icon} text-[#283943] text-lg`;
  }
}
