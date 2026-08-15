import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastsComponent } from '../components/toasts.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastsComponent],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro <span class="admin-tag">Admin</span></span>
        </div>
        <nav>
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: false }"
             class="nav-item">
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/dashboard" class="nav-item"><span class="nav-icon">&#8678;</span> User view</a>
          <a (click)="logout()" class="nav-item"><span class="nav-icon">&#8678;</span> Logout</a>
        </div>
      </aside>
      <div class="main">
        <header class="header">
          <h1 class="page-title">Admin Console</h1>
          <div class="header-spacer"></div>
          <span class="user-name">{{ user?.name }}</span>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toasts />
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 230px; flex-shrink: 0;
      background: #111827;
      border-right: 1px solid var(--card-border);
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh;
    }
    .brand { display: flex; align-items: center; gap: 10px; padding: 20px; }
    .logo {
      width: 34px; height: 34px; border-radius: 10px;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px;
    }
    .brand-name { font-weight: 800; font-size: 16px; }
    .admin-tag {
      font-size: 10px; background: var(--primary); color: #fff;
      padding: 2px 7px; border-radius: 999px; vertical-align: middle;
    }
    nav { flex: 1; padding: 8px 12px; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 10px;
      color: var(--text-muted); cursor: pointer;
      margin-bottom: 2px; font-weight: 500;
    }
    .nav-item:hover { color: var(--text); background: rgba(255,255,255,.04); }
    .nav-item.active { background: var(--primary); color: #fff; }
    .nav-icon { width: 20px; text-align: center; font-size: 15px; }
    .sidebar-footer { padding: 12px; border-top: 1px solid var(--card-border); }
    .main { flex: 1; min-width: 0; }
    .header {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 24px;
      background: var(--bg-soft);
      border-bottom: 1px solid var(--card-border);
      position: sticky; top: 0; z-index: 10;
    }
    .page-title { font-size: 16px; font-weight: 700; }
    .header-spacer { flex: 1; }
    .user-name { font-weight: 600; font-size: 13px; }
    .content { padding: 24px; }
    @media (max-width: 768px) { .sidebar { display: none; } }
  `],
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '&#9639;' },
    { label: 'Users', route: '/admin/users', icon: '&#9679;' },
    { label: 'Investment Plans', route: '/admin/plans', icon: '&#9650;' },
    { label: 'Investments', route: '/admin/investments', icon: '&#9660;' },
    { label: 'Deposits', route: '/admin/deposits', icon: '&#10133;' },
    { label: 'Withdrawals', route: '/admin/withdrawals', icon: '&#10134;' },
    { label: 'KYC Reviews', route: '/admin/kyc', icon: '&#10003;' },
    { label: 'Reports', route: '/admin/reports', icon: '&#128202;' },
  ];

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
