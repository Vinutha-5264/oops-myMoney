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
    <div class="login-container">
      <div class="sticker">New!</div>
      <div class="header">
        <div class="logo-container">
          <img src="https://cdn-icons-png.flaticon.com/512/4149/4149706.png" alt="Pink glitter wallet with bow and heart details" class="wallet-img">
          <div class="welcome-text">
            Hey gorgeous! 💕<br>
            Your fabulous finance journey starts here!<br>
            Let's slay those savings goals 💖✨
          </div>
        </div>
        <h1>Welcome to OopsMyMoney</h1>
        <p class="subtitle">Where finance meets fabulous!</p>
      </div>

      <form (ngSubmit)="login()" class="login-form">
        <div class="form-group">
          <label for="username">Your Super Cute Username</label>
          <i class="fas fa-user input-icon"></i>
          <input [(ngModel)]="username" name="username" required placeholder="princess_payments" class="input-field" />
        </div>

        <div class="form-group">
          <label for="password">Your Secret Password</label>
          <i class="fas fa-lock input-icon"></i>
          <input [(ngModel)]="password" name="password" required type="password" placeholder="shhh... it's secret!" class="input-field" />
        </div>

        <button type="submit" class="submit-button">
          <i class="fas fa-sparkles" style="margin-right: 8px;"></i>
          Sparkle Your Way In ✨
        </button>
        <p *ngIf="error" class="error-message">{{ error }}</p>
      </form>

      <div class="footer">
        <div class="register-text">Ready to be a money queen? 👑</div>
        <div class="developer-contact">
          Contact developer for credentials<br>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background-color: #fff5f9;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .login-container {
      background: linear-gradient(145deg, #ffdeed, #f5e1ff);
      width: 100%;
      max-width: 400px;
      padding: 30px;
      border-radius: 25px;
      box-shadow: 0 10px 30px rgba(214, 130, 189, 0.2);
      position: relative;
      overflow: hidden;
    }

    .sticker {
      position: absolute;
      width: 60px;
      height: 60px;
      right: -10px;
      top: -10px;
      background-color: #ff9a8b;
      background-image: linear-gradient(45deg, #ff9a8b 0%, #ff6b88 55%, #ff8e53 100%);
      border-radius: 50%;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 4px 10px rgba(255, 116, 188, 0.3);
      transform: rotate(15deg);
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-bottom: 15px;
    }

    .wallet-img {
      width: 100px;
      height: 100px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(222, 87, 175, 0.3));
    }

    .welcome-text {
      font-size: 16px;
      color: #d061a3;
      margin: 15px 0;
      line-height: 1.4;
    }

    h1 {
      color: #9c3d98;
      font-size: 24px;
      margin-bottom: 5px;
      font-weight: 700;
    }

    .subtitle {
      color: #c27bbe;
      font-size: 14px;
    }

    .login-form {
      position: relative;
      z-index: 1;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #a45ca4;
      font-size: 14px;
      font-weight: 500;
    }

    .input-field {
      width: 100%;
      padding: 15px 20px;
      padding-left: 45px;
      border: none;
      border-radius: 15px;
      background-color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      color: #5e3b5e;
      box-shadow: 0 4px 10px rgba(180, 123, 180, 0.1);
      transition: all 0.3s;
    }

    .input-field:focus {
      outline: none;
      background-color: white;
      box-shadow: 0 4px 15px rgba(180, 123, 180, 0.2);
    }

    .input-icon {
      position: absolute;
      left: 15px;
      top: 38px;
      color: #d870d2;
    }

    .submit-button {
      width: 100%;
      padding: 15px;
      background: linear-gradient(to right, #e85db8, #c45bc1);
      color: white;
      border: none;
      border-radius: 15px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(208, 109, 201, 0.3);
      transition: all 0.3s;
    }

    .submit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(208, 109, 201, 0.4);
    }

    .error-message {
      color: #ff3860;
      font-size: 14px;
      text-align: center;
      margin-top: 15px;
      min-height: 20px;
    }

    .footer {
      text-align: center;
      margin-top: 25px;
      font-size: 13px;
    }

    .register-text {
      color: #c27bbe;
      margin-bottom: 5px;
    }

    .developer-contact {
      color: #9c3d98;
      font-size: 11px;
      line-height: 1.4;
    }
  `]
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
