import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-expense.component.html',
})
export class AddExpenseComponent implements OnInit {
  amount: number = 0;
  selectedCategory: string = '';
  categories: Category[] = [];

  username = localStorage.getItem('username') || '';

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    this.categories = await this.categoryService.getCategoriesByUser(this.username);
  }

  async addExpense() {
    if (!this.selectedCategory || !this.amount || this.amount <= 0) {
      alert('Please select category and enter valid amount.');
      return;
    }

    await this.expenseService.addExpense({
      amount: this.amount,
      category: this.selectedCategory,
      username: this.username,
    });

    // Clear form
    this.amount = 0;
    this.selectedCategory = '';
    alert('Expense added!');
  }
}
