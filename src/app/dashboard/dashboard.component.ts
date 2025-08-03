import { Component, OnInit, inject } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatBoxComponent } from './stat-box.component';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, StatBoxComponent, NgChartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];

  totalSpent = 0;
  monthlyTotal = 0;
  yearlyTotal = 0;
  categoryTotals: { [category: string]: number } = {};

  categories: string[] = [];
  username = localStorage.getItem('username') || '';

  newExpense = { amount: 0, category: '' };
  newCategory = '';
  editingExpense: Expense | null = null;

  showForm = false;
  showCategoryInput = false;
  filterOption: string = 'thisMonth';

  selectedFilter: string = 'thisMonth';
 // used in the dropdown

  // Pie Chart data
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];

  async ngOnInit() {
    await this.loadExpenses();
    await this.loadCategories();
  }

  async loadExpenses() {
    this.expenses = await this.expenseService.getExpensesByUser(this.username);
    this.applyFilter();
  }

  async loadCategories() {
    this.categories = await this.expenseService.getCategoriesForUser(this.username);
  }

  async submitExpense(event: Event) {
    event.preventDefault();
    if (!this.newExpense.category || this.newExpense.amount <= 0) return;

    await this.expenseService.addExpense({
      amount: this.newExpense.amount,
      category: this.newExpense.category,
      username: this.username
    });

    await this.loadExpenses();
    this.newExpense = { amount: 0, category: '' };
    this.showForm = false;
  }

  async addCategory() {
    const trimmed = this.newCategory.trim();
    if (!trimmed || this.categories.includes(trimmed)) return;

    this.categories.push(trimmed);
    await this.expenseService.saveCategory(this.username, trimmed);
    this.newCategory = '';
    this.showCategoryInput = false;
  }

  async deleteExpense(exp: Expense) {
    if (!confirm('Delete this expense?')) return;
    const ref = doc(db, 'expenses', exp.id!);
    await deleteDoc(ref);
    await this.loadExpenses();
  }

  editExpense(exp: Expense) {
    this.editingExpense = { ...exp };
  }

  cancelEdit() {
    this.editingExpense = null;
  }

  async submitEdit() {
    if (!this.editingExpense) return;

    const ref = doc(db, 'expenses', this.editingExpense.id!);
    await updateDoc(ref, {
      amount: this.editingExpense.amount,
      category: this.editingExpense.category
    });

    this.editingExpense = null;
    await this.loadExpenses();
  }

  applyFilter() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.filteredExpenses = this.expenses.filter(exp => {
      const date = new Date(exp.date);
      switch (this.selectedFilter) {
        case 'thisMonth':
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        case 'lastMonth':
          const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
          return date.getFullYear() === lastMonthDate.getFullYear() &&
                 date.getMonth() === lastMonthDate.getMonth();
        case 'thisYear':
          return date.getFullYear() === currentYear;
        case 'all':
        default:
          return true;
      }
    });

    this.calculateTotals(this.filteredExpenses);
  }

  categoryKeys() {
    return Object.keys(this.categoryTotals);
  }

  private calculateTotals(data: Expense[] = this.expenses) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.totalSpent = 0;
    this.monthlyTotal = 0;
    this.yearlyTotal = 0;
    this.categoryTotals = {};

    for (const expense of data) {
      const date = new Date(expense.date);
      const amount = expense.amount;
      const category = expense.category || 'Uncategorized';

      this.totalSpent += amount;

      if (date.getFullYear() === currentYear) {
        this.yearlyTotal += amount;
        if (date.getMonth() === currentMonth) {
          this.monthlyTotal += amount;
        }
      }

      if (!this.categoryTotals[category]) {
        this.categoryTotals[category] = 0;
      }
      this.categoryTotals[category] += amount;
    }

    this.updatePieChart();
  }

  private updatePieChart() {
    this.pieChartLabels = this.categoryKeys();
    this.pieChartData = this.pieChartLabels.map(cat => this.categoryTotals[cat]);
  }
}
