import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationItem } from '../../core/models';
import { ToastsComponent } from '../components/toasts.component';
import { ThemeToggleComponent } from '../components/theme-toggle.component';
import { SupportWidgetComponent } from '../components/support-widget.component';
import { AnnouncementBarComponent } from '../components/announcement-bar.component';
import { AdvertisementComponent } from '../components/advertisement.component';
import { LanguageSelectorComponent } from '../components/language-selector.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastsComponent, ThemeToggleComponent, SupportWidgetComponent, AnnouncementBarComponent, AdvertisementComponent, LanguageSelectorComponent],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="logo">IP</span>
          <span class="brand-name">InvestPro</span>
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
          <a (click)="logout()" class="nav-item">
            <span class="nav-icon">&#8678;</span>
            Logout
          </a>
        </div>
      </aside>

      <div class="main">
        <header class="header">
          <button class="icon-btn" (click)="sidebarOpen = !sidebarOpen">&#9776;</button>
          <div class="header-spacer"></div>
          <app-language-selector />
          <app-theme-toggle />
          <button class="icon-btn" (click)="goNotifications()" title="Notifications">
            &#128276;<span *ngIf="unread > 0" class="unread-dot">{{ unread > 9 ? '9+' : unread }}</span>
          </button>
          <div class="user-chip" (click)="goProfile()">
            <span class="avatar"><img *ngIf="user?.avatar" [src]="user!.avatar" alt=""/><span *ngIf="!user?.avatar">{{ initials }}</span></span>
            <span class="user-meta">
              <span class="user-name">{{ user?.name }}</span>
              <span class="user-role">{{ user?.role }}</span>
            </span>
          </div>
        </header>

        <main class="content">
          <router-outlet />
          <div class="ad-footer">
            <app-advertisement position="sidebar" />
          </div>
        </main>
      </div>
    </div>
    <app-support-widget />
    <app-toasts />
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 230px; flex-shrink: 0;
      background: var(--bg-soft);
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
    .brand-name { font-weight: 800; font-size: 17px; }
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
    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .header {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 24px;
      background: var(--bg-soft);
      border-bottom: 1px solid var(--card-border);
      position: sticky; top: 0; z-index: 10;
    }
    .header-spacer { flex: 1; }
    .icon-btn {
      position: relative;
      width: 38px; height: 38px;
      border: 1px solid var(--card-border); border-radius: 10px;
      background: transparent; color: var(--text);
      font-size: 17px; cursor: pointer;
    }
    .icon-btn:hover { border-color: var(--primary); }
    .unread-dot {
      position: absolute; top: -6px; right: -6px;
      background: var(--danger); color: #fff;
      font-size: 10px; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }
    .user-chip { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-weight: 600; font-size: 13px; }
    .user-role { color: var(--text-muted); font-size: 11px; text-transform: capitalize; }
    .content { padding: 24px; }
    .ad-footer { margin-top: 24px; }
    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `],
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  sidebarOpen = false;
  unread = 0;
  user = this.auth.user;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '&#9639;' },
    { label: 'Portfolio', route: '/portfolio', icon: '&#9638;' },
    { label: 'Plans', route: '/plans', icon: '&#9733;' },
    { label: 'Investments', route: '/investments', icon: '&#9650;' },
    { label: 'Wallet', route: '/wallet', icon: '&#128176;' },
    { label: 'Deposit', route: '/deposits', icon: '&#10133;' },
    { label: 'Transactions', route: '/transactions', icon: '&#8646;' },
    { label: 'Withdraw', route: '/withdrawals', icon: '&#10134;' },
    { label: 'Referrals', route: '/referrals', icon: '&#128101;' },
    { label: 'Activity', route: '/activity', icon: '&#128200;' },
    { label: 'Security', route: '/security', icon: '&#128274;' },
    { label: 'Notifications', route: '/notifications', icon: '&#128276;' },
    { label: 'KYC', route: '/kyc', icon: '&#10003;' },
    { label: 'Profile', route: '/profile', icon: '&#9679;' },
  ];

  get initials(): string {
    const name = this.user?.name ?? '?';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.auth.user$.subscribe((u) => (this.user = u));

    if (this.user) {
      this.api.get<{ unread_count: number }>('/notifications/unread-count').subscribe({
        next: (res) => (this.unread = res.unread_count),
        error: () => undefined,
      });
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }

  goNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }
}
