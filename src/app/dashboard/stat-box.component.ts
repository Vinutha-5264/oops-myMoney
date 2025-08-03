import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-box',
  standalone: true,
  template: `
    <div class="bg-white p-4 rounded shadow text-center">
      <h4 class="text-gray-600">{{ label }}</h4>
      <p class="text-2xl font-bold">₹{{ value }}</p>
    </div>
  `
})
export class StatBoxComponent {
  @Input() label = '';
  @Input() value = 0;
}
