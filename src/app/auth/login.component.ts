import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="login()">
      <input [(ngModel)]="username" name="username" required placeholder="Username" />
      <input [(ngModel)]="password" name="password" required type="password" placeholder="Password" />
      <button type="submit">Login</button>
      <p *ngIf="error" style="color:red">{{ error }}</p>
    </form>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async login() {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('username', '==', this.username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      this.error = 'Invalid username';
      return;
    }

    const user = snapshot.docs[0].data() as { username: string; password: string };

    if (user.password !== this.password) {
      this.error = 'Incorrect password';
      return;
    }

    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', this.username);
    this.router.navigate(['/dashboard']);
  }
}
