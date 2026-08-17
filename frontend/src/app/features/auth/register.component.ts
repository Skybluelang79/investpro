import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <form class="auth-card" (ngSubmit)="onSubmit()">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro</span>
        </div>
        <h1>Create your account</h1>
        <p class="muted mb-2">Start growing your wealth today.</p>

        <div class="field">
          <label>Full name</label>
          <input class="input" type="text" [(ngModel)]="model.name" name="name" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input class="input" type="email" [(ngModel)]="model.email" name="email" required />
        </div>
        <div class="field">
          <label>Phone (optional)</label>
          <input class="input" type="text" [(ngModel)]="model.phone" name="phone" />
        </div>
        <div class="field">
          <label>Password</label>
          <input class="input" type="password" [(ngModel)]="model.password" name="password" required minlength="8" />
        </div>
        <div class="field">
          <label>Confirm password</label>
          <input class="input" type="password" [(ngModel)]="model.password_confirmation" name="password_confirmation" required />
        </div>
        <div class="field">
          <label>Referral code (optional)</label>
          <input class="input" type="text" [(ngModel)]="model.referral_code" name="referral_code" />
        </div>

        <p *ngIf="error" class="error">{{ error }}</p>

        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>

        <p class="muted small mt-2">
          Already registered? <a routerLink="/auth/login" class="link">Sign in</a>
        </p>
        <p class="muted small">
          <a routerLink="/" class="link">&larr; Back to home</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { width: 100%; max-width: 420px; background: var(--card); border: 1px solid var(--card-border); border-radius: 18px; padding: 32px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .logo { width: 38px; height: 38px; border-radius: 10px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .brand-name { font-weight: 800; font-size: 18px; }
    h1 { font-size: 22px; margin-bottom: 6px; }
    .btn-block { width: 100%; margin-top: 8px; }
    .link { color: var(--primary); font-weight: 600; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  model = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    referral_code: '',
  };
  loading = false;
  error = '';

  ngOnInit(): void {
    this.model.referral_code = this.route.snapshot.queryParamMap.get('referral') ?? '';
  }

  onSubmit(): void {
    if (this.model.password !== this.model.password_confirmation) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.auth.register(this.model).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to InvestPro.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const errors = err.error?.errors;
        if (errors) {
          this.error = Object.values(errors).flat().join(' ');
        } else {
          this.error = err.error?.message ?? 'Registration failed.';
        }
      },
    });
  }
}
