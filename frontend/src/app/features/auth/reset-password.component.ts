import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <form class="auth-card" (ngSubmit)="onSubmit()">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro</span>
        </div>
        <h1>Set new password</h1>
        <p class="muted mb-2">Enter your new password below.</p>

        <div class="field">
          <label>Password</label>
          <input class="input" type="password" [(ngModel)]="password" name="password" required minlength="8" />
        </div>
        <div class="field">
          <label>Confirm password</label>
          <input class="input" type="password" [(ngModel)]="password_confirmation" name="password_confirmation" required />
        </div>

        <p *ngIf="error" class="error">{{ error }}</p>

        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
          {{ loading ? 'Resetting password...' : 'Reset password' }}
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
export class ResetPasswordComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  token = '';
  email = '';
  password = '';
  password_confirmation = '';
  loading = false;
  error = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  onSubmit(): void {
    this.error = '';

    if (!this.token || !this.email) {
      this.error = 'Invalid reset link. Please request a new one.';
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.http.post<{ message: string }>('/api/v1/reset-password', {
      email: this.email,
      token: this.token,
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
  }
}
