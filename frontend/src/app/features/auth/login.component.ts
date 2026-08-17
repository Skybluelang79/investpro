import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SocialLoginComponent } from './social-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SocialLoginComponent],
  template: `
    <div class="auth-wrap">
      <form class="auth-card" (ngSubmit)="onSubmit()">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro</span>
        </div>
        <h1>Welcome back</h1>
        <p class="muted mb-2">Sign in to manage your investments.</p>

        <app-social-login />

        <div class="divider"><span>or continue with email</span></div>

        <div class="field">
          <label>Email</label>
          <input class="input" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label>Password</label>
          <input class="input" type="password" [(ngModel)]="password" name="password" required />
        </div>
        <p class="muted small" style="text-align:right;margin-top:-4px;margin-bottom:8px">
          <a routerLink="/auth/forgot-password" class="link">Forgot password?</a>
        </p>

        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="muted small mt-2">
          No account yet? <a routerLink="/auth/register" class="link">Create one</a>
        </p>
        <p class="muted small">
          <a routerLink="/" class="link">&larr; Back to home</a>
        </p>
        <p class="muted small mt-1" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--card-border)">
          Demo admin: admin&#64;investpro.test / password123<br/>
          Demo user: demo&#64;investpro.test / password
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
    .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: var(--text-muted); font-size: 12px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--card-border); }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = false;

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.user.name}!`);
        this.router.navigate([res.user.role === 'admin' ? '/admin/dashboard' : '/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? err.error?.errors?.email?.[0] ?? 'Login failed.');
      },
    });
  }
}
