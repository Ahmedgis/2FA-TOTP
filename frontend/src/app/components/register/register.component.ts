import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Register</h2>
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
      <button (click)="onRegister()" class="btn-primary">Register</button>

      <div *ngIf="qrCode" class="qr-code">
        <h3>Scan this QR code with your authenticator app</h3>
        <img [src]="qrCode" alt="TOTP QR Code" />
        <p class="warning">Important: Save this QR code now. It won't be shown again!</p>

        <div class="totp-input">
          <label for="totpCode">Enter the 6-digit code from your authenticator app:</label>
          <input
            type="text"
            id="totpCode"
            [(ngModel)]="totpCode"
            class="form-control"
            maxlength="6"
            placeholder="Enter 6-digit code"
            required
          />
          <button (click)="verifyTotp()" class="btn-primary">Verify & Complete Registration</button>
        </div>
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>
      <div *ngIf="success" class="success">
        {{ success }}
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
    }
    .btn-primary:hover {
      background-color: #0056b3;
    }
    .qr-code {
      margin-top: 2rem;
      text-align: center;
    }
    .qr-code img {
      max-width: 200px;
      margin: 1rem 0;
    }
    .warning {
      color: #dc3545;
      font-weight: bold;
    }
    .error {
      color: #dc3545;
      margin-top: 1rem;
    }
    .success {
      color: #59dc35;
      margin-top: 1rem;
    }
  `]
})
export class RegisterComponent {
  username = '';
  password = '';
  qrCode = '';
  error = '';
  totpCode = '';
  tempSecret = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.username || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.authService.register(this.username, this.password).subscribe({
      next: (response) => {
        this.qrCode = response.qrCode;
        this.tempSecret = response.secret;
      },
      error: (error) => {
        this.error = error.error.error || 'Registration failed';
      }
    });
  }

  verifyTotp() {
    if (!this.totpCode || this.totpCode.length !== 6) {
      this.error = 'Please enter a valid 6-digit code';
      return;
    }

    this.authService.verifyAndCompleteRegistration(this.username, this.password, this.totpCode).subscribe({
      next: () => {
        this.success = 'verification successful';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.error = error.error.message || 'Invalid TOTP code. Please try again.';
      }
    });
  }
}
