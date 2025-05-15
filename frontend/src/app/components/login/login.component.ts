import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <h2>Login</h2>
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          [(ngModel)]="username"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          [(ngModel)]="password"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="token">2FA Code:</label>
        <input
          type="text"
          id="token"
          [(ngModel)]="token"
          class="form-control"
          maxlength="6"
          placeholder="Enter 6-digit code"
          required
        />
      </div>
      <button (click)="onLogin()" class="btn-primary">Login</button>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="success" class="success">
        {{ success }}
      </div>

      <div class="register-link">
        <p>Don't have an account? <a routerLink="/register">Register here</a></p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    .btn-primary:hover {
      background-color: #0056b3;
    }
    .error {
      color: #dc3545;
      margin-top: 1rem;
    }
    .success {
      color: #59dc35;
      margin-top: 1rem;
    }
    .register-link {
      margin-top: 1rem;
      text-align: center;
    }
    .register-link a {
      color: #007bff;
      text-decoration: none;
    }
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  token = '';
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.success = '';
    this.error = '';

    if (!this.username || !this.password || !this.token) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.token.length !== 6) {
      this.error = 'TOTP code must be 6 digits';
      return;
    }

    this.authService.login(this.username, this.password, this.token).subscribe({
      next: () => {
        this.success = 'Login successful';
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = error.error.message || 'Login failed';
      }
    });
  }
}
