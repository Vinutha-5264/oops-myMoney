import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AddExpenseComponent } from './dashboard/add-expense.componen';
export const routes: Routes = [
  { path: '', component: LoginComponent },
  // in app.routes.ts or equivalent
{ path: 'add-expense', component: AddExpenseComponent },

  { path: 'dashboard', component: DashboardComponent }
];
