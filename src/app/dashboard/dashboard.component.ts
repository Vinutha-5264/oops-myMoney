import { Component, OnInit, inject } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { CategoryService } from '../services/category.service';
import { Expense } from '../models/expense.model';
import { Category } from '../models/category.model';
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
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  paginatedExpenses: Expense[] = [];

  totalSpent = 0;
  monthlyTotal = 0;
  yearlyTotal = 0;
  categoryTotals: { [category: string]: number } = {};

  username = localStorage.getItem('username') || '';

  newExpense = { amount: 0 };
  newCategory = '';
  newSubcategory = '';

  editingExpense: Expense | null = null;

  showForm = false;
  showCategoryInput = false;

  filterOption: string = 'thisMonth';
  selectedFilter: string = 'thisMonth';

  categories: Category[] = [];
  newCategoryName = '';

  selectedCategoryId: string = '';
  selectedSubcategory: string = '';

  showMainCategoryInput: boolean = false;
  showSubcategoryInput: boolean = false;

  filteredSubcategories: string[] = [];

  // Chart data
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartType: 'pie' | 'bar' = 'bar';
  chartOptions: any;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Date range filter
  startDate: string = '';
  endDate: string = '';

  async ngOnInit() {
    await this.loadExpenses();
    await this.loadCategories();
  }

  async loadExpenses() {
    this.expenses = await this.expenseService.getExpensesByUser(this.username);
    this.applyFilter();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getCategoriesByUser(this.username);
  }

  getSelectedSubcategories(): string[] {
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat?.subcategories || [];
  }

  filterSubcategorySuggestions() {
    const typed = this.selectedSubcategory.toLowerCase();
    const allSubs = this.getSelectedSubcategories();
    this.filteredSubcategories = allSubs.filter(
      sub => sub.toLowerCase().includes(typed) && sub.toLowerCase() !== typed
    );
  }

  selectSubcategory(sub: string) {
    this.selectedSubcategory = sub;
    this.filteredSubcategories = [];
  }

  async submitExpense(event: Event) {
    event.preventDefault();
    if (!this.selectedCategoryId || !this.selectedSubcategory || this.newExpense.amount <= 0) return;

    const categoryObj = this.categories.find(c => c.id === this.selectedCategoryId);
    const fullCategory = `${categoryObj?.name}:${this.selectedSubcategory}`;

    if (!this.getSelectedSubcategories().includes(this.selectedSubcategory)) {
      await this.categoryService.addSubcategory(this.selectedCategoryId, this.selectedSubcategory);
      await this.loadCategories();
    }

    await this.expenseService.addExpense({
      amount: this.newExpense.amount,
      category: fullCategory,
      username: this.username
    });

    await this.loadExpenses();
    this.newExpense = { amount: 0 };
    this.selectedCategoryId = '';
    this.selectedSubcategory = '';
    this.showForm = false;
  }

  async addCategory() {
    const trimmed = this.newCategory.trim();
    if (!trimmed) return;

    await this.categoryService.addCategory(trimmed, this.username);
    this.newCategory = '';
    this.showCategoryInput = false;
    await this.loadCategories();
  }

  async addSubcategory() {
    const trimmed = this.newSubcategory.trim();
    if (!trimmed || !this.selectedCategoryId) return;

    await this.categoryService.addSubcategory(this.selectedCategoryId, trimmed);
    this.newSubcategory = '';
    await this.loadCategories();
  }

  async deleteSelectedCategory() {
    if (!this.selectedCategoryId) return;
    const confirmDelete = confirm(
      'Are you sure you want to delete this category? This cannot be undone.'
    );
    if (!confirmDelete) return;
    await this.categoryService.deleteCategory(this.selectedCategoryId);
    this.selectedCategoryId = '';
    await this.loadCategories();
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
      let matchesFilter = false;
      switch (this.filterOption) {
        case 'thisMonth':
          matchesFilter = date.getFullYear() === currentYear && date.getMonth() === currentMonth;
          break;
        case 'lastMonth':
          const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
          matchesFilter =
            date.getFullYear() === lastMonthDate.getFullYear() &&
            date.getMonth() === lastMonthDate.getMonth();
          break;
        case 'thisYear':
          matchesFilter = date.getFullYear() === currentYear;
          break;
        case 'all':
        default:
          matchesFilter = true;
      }

      if (this.startDate) {
        matchesFilter = matchesFilter && date >= new Date(this.startDate);
      }
      if (this.endDate) {
        matchesFilter = matchesFilter && date <= new Date(this.endDate);
      }

      return matchesFilter;
    });

    this.calculateTotals(this.filteredExpenses);
    this.setupPagination();
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.filteredExpenses.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePaginatedExpenses();
  }

  updatePaginatedExpenses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedExpenses = this.filteredExpenses.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedExpenses();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedExpenses();
    }
  }

  categoryKeys() {
    return Object.keys(this.categoryTotals);
  }

  // ✅ Updated to group only by main category
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

      // Only take the main category (before ':')
      const mainCategory = expense.category?.split(':')[0] || 'Uncategorized';

      this.totalSpent += amount;

      if (date.getFullYear() === currentYear) {
        this.yearlyTotal += amount;
        if (date.getMonth() === currentMonth) {
          this.monthlyTotal += amount;
        }
      }

      if (!this.categoryTotals[mainCategory]) {
        this.categoryTotals[mainCategory] = 0;
      }
      this.categoryTotals[mainCategory] += amount;
    }

    this.updateChart();
  }

  private updateChart() {
    this.chartLabels = this.categoryKeys();
    this.chartData = this.chartLabels.map(cat => this.categoryTotals[cat]);

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: this.chartType === 'pie'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `₹${context.parsed.y ?? context.parsed}`
          }
        }
      },
      scales: this.chartType === 'bar' ? {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Amount (₹)' }
        },
        x: {
          title: { display: true, text: 'Category' }
        }
      } : {}
    };
  }

  toggleChartType() {
    this.chartType = this.chartType === 'pie' ? 'bar' : 'pie';
    this.updateChart();
  }
}
