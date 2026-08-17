import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <form class="auth-card" (ngSubmit)="onSubmit()">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro</span>
        </div>

        <ng-container *ngIf="step === 'email'">
          <h1>Forgot password?</h1>
          <p class="muted mb-2">Enter your email and we'll send you a reset code.</p>

          <div class="field">
            <label>Email</label>
            <input class="input" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
          </div>
        </ng-container>

        <ng-container *ngIf="step === 'reset'">
          <h1>Reset password</h1>
          <p class="muted mb-2">Enter the code sent to <strong>{{ email }}</strong> and your new password.</p>

          <div class="field">
            <label>Reset code</label>
            <input class="input" type="text" [(ngModel)]="code" name="code" required autocomplete="one-time-code" />
          </div>
          <div class="field">
            <label>New password</label>
            <input class="input" type="password" [(ngModel)]="password" name="password" required minlength="8" />
          </div>
          <div class="field">
            <label>Confirm password</label>
            <input class="input" type="password" [(ngModel)]="password_confirmation" name="password_confirmation" required />
          </div>
        </ng-container>

        <p *ngIf="error" class="error">{{ error }}</p>

        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
          {{ loadingLabel }}
        </button>

        <p class="muted small mt-2">
          <a routerLink="/auth/login" class="link">&larr; Back to login</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { width: 100%; max-width: 400px; background: var(--card); border: 1px solid var(--card-border); border-radius: 18px; padding: 32px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .logo { width: 38px; height: 38px; border-radius: 10px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .brand-name { font-weight: 800; font-size: 18px; }
    h1 { font-size: 22px; margin-bottom: 6px; }
    .btn-block { width: 100%; margin-top: 8px; }
    .link { color: var(--primary); font-weight: 600; }
    .error { color: var(--danger); font-size: 13px; margin-top: 8px; }
  `],
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  step: 'email' | 'reset' = 'email';
  email = '';
  code = '';
  password = '';
  password_confirmation = '';
  resetToken = '';
  loading = false;
  error = '';

  get loadingLabel(): string {
    if (this.loading) return this.step === 'email' ? 'Sending code...' : 'Resetting password...';
    return this.step === 'email' ? 'Send reset code' : 'Reset password';
  }

  onSubmit(): void {
    this.error = '';

    if (this.step === 'email') {
      this.requestCode();
    } else {
      this.resetPassword();
    }
  }

  private requestCode(): void {
    if (!this.email) return;

    this.loading = true;
    this.http.post<{ message: string }>('/api/v1/forgot-password', { email: this.email }).subscribe({
      next: (res) => {
        this.toast.success(res.message ?? 'Code sent! Check your email.');
        this.step = 'reset';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Failed to send reset code.';
      },
    });
  }

  private resetPassword(): void {
    if (this.password !== this.password_confirmation) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.http.post<{ message: string; token?: string }>('/api/v1/verify-reset-code', {
      email: this.email,
      code: this.code,
    }).subscribe({
      next: (res) => {
        const token = res.token ?? this.resetToken;
        this.http.post<{ message: string }>('/api/v1/reset-password', {
          email: this.email,
          token,
          code: this.code,
          password: this.password,
          password_confirmation: this.password_confirmation,
        }).subscribe({
          next: (res) => {
            this.toast.success(res.message ?? 'Password reset successfully!');
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message ?? 'Failed to reset password.';
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Invalid or expired code.';
      },
    });
  }
}
