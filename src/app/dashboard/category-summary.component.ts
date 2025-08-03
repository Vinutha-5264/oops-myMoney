import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-summary">
      <span>{{ category }}</span>
      <span>{{ amount | currency }}</span>
    </div>
  `,
  styles: [`
    .category-summary {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0.5rem 0;
    }
  `]
})
export class CategorySummaryComponent {
  @Input() category!: string;
  @Input() amount!: number;
}
