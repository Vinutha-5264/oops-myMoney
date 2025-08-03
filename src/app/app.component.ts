import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <nav>
        <button *ngIf="isLoggedIn()" (click)="logout()">Logout</button>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      font-family: sans-serif;
    }
    nav {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    button {
      padding: 6px 12px;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  logout() {
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/']);
  }
}
