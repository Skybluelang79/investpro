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

        <ng-container *ngIf="!requires2fa">
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
        </ng-container>

        <ng-container *ngIf="requires2fa">
          <h1>Two-Factor Authentication</h1>
          <p class="muted mb-2">Enter the 6-digit code from your authenticator app, or use a recovery code.</p>

          <div class="field">
            <label>Email</label>
            <input class="input" type="email" [value]="email" disabled />
          </div>
          <div class="field">
            <label>Authentication Code</label>
            <input class="input" type="text" [(ngModel)]="twoFaCode" name="twoFaCode"
              placeholder="000000 or XXXX-XXXX" maxlength="9" required autofocus />
          </div>
          <p class="muted small" style="margin-bottom:8px">
            <a class="link" (click)="useRecoveryCode()" style="cursor:pointer">
              {{ showRecoveryHint ? 'Use authenticator app instead' : 'Use a recovery code instead' }}
            </a>
          </p>
          <p class="muted small" *ngIf="showRecoveryHint">
            Enter one of your 8-character recovery codes (e.g. ABCD-EFGH).
          </p>
        </ng-container>

        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
          {{ loading ? (requires2fa ? 'Verifying...' : 'Signing in...') : (requires2fa ? 'Verify' : 'Sign in') }}
        </button>

        <p *ngIf="requires2fa" class="muted small mt-2" style="text-align:center">
          <a class="link" (click)="backToLogin()" style="cursor:pointer">&larr; Back to login</a>
        </p>

        <ng-container *ngIf="!requires2fa">
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
        </ng-container>
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
  twoFaCode = '';
  loading = false;
  requires2fa = false;
  showRecoveryHint = false;

  onSubmit(): void {
    if (this.requires2fa) {
      this.verify2FA();
    } else {
      this.loginWithPassword();
    }
  }

  loginWithPassword(): void {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.requires_2fa) {
          this.requires2fa = true;
          this.loading = false;
          return;
        }
        this.toast.success(`Welcome back, ${res.user!.name}!`);
        this.router.navigate([res.user!.role === 'admin' ? '/admin/dashboard' : '/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? err.error?.errors?.email?.[0] ?? 'Login failed.');
      },
    });
  }

  verify2FA(): void {
    if (!this.twoFaCode || this.twoFaCode.length < 6) return;

    this.loading = true;
    this.auth.verify2FA(this.email, this.twoFaCode).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.user.name}!`);
        this.router.navigate([res.user.role === 'admin' ? '/admin/dashboard' : '/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Invalid code. Please try again.');
        this.twoFaCode = '';
      },
    });
  }

  useRecoveryCode(): void {
    this.showRecoveryHint = !this.showRecoveryHint;
    this.twoFaCode = '';
  }

  backToLogin(): void {
    this.requires2fa = false;
    this.twoFaCode = '';
    this.showRecoveryHint = false;
    this.password = '';
  }
}
