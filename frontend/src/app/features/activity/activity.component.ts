import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

interface ActivityStats {
  total_actions: number;
  login_count: number;
  last_login: string;
}

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Activity Log</h1>

    <div class="grid-3 mb-2" *ngIf="stats">
      <div class="card stat">
        <div class="stat-label muted">Total Actions</div>
        <div class="stat-value mono">{{ stats.total_actions | number }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label muted">Login Count</div>
        <div class="stat-value mono">{{ stats.login_count | number }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label muted">Last Login</div>
        <div class="stat-value small">{{ stats.last_login ? (stats.last_login | date: 'medium') : '-' }}</div>
      </div>
    </div>

    <div class="page-head mb-2">
      <div class="filters-row">
        <select class="input filter" [(ngModel)]="actionFilter" (change)="load()">
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="password_change">Password Change</option>
          <option value="profile_update">Profile Update</option>
          <option value="2fa_enable">2FA Enable</option>
          <option value="2fa_disable">2FA Disable</option>
          <option value="investment">Investment</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>Action</th><th>Description</th><th>IP Address</th><th>Date</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of logs">
            <td><span class="badge badge-info">{{ log.action }}</span></td>
            <td class="small">{{ log.description ?? '-' }}</td>
            <td class="mono small">{{ log.ip_address ?? '-' }}</td>
            <td class="small">{{ log.created_at | date: 'medium' }}</td>
          </tr>
          <tr *ngIf="logs.length === 0"><td colspan="4" class="empty">No activity found.</td></tr>
        </tbody>
      </table>

      <div class="pager" *ngIf="meta.total > 0">
        <button class="btn btn-outline btn-sm" [disabled]="page <= 1" (click)="go(page - 1)">&laquo; Prev</button>
        <span class="muted small">Page {{ page }} of {{ meta.last_page }}</span>
        <button class="btn btn-outline btn-sm" [disabled]="page >= meta.last_page" (click)="go(page + 1)">Next &raquo;</button>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filter { width: 220px; }
    .pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; }
  `],
})
export class ActivityComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  logs: ActivityLog[] = [];
  stats?: ActivityStats;
  actionFilter = '';
  page = 1;
  meta = { last_page: 1, total: 0 };

  ngOnInit(): void {
    this.api.get<{ total_actions: number; login_count: number; last_login: string }>('/activity/stats').subscribe({
      next: (res) => (this.stats = res),
      error: () => (this.stats = { total_actions: 0, login_count: 0, last_login: '' }),
    });
    this.load();
  }

  load(): void {
    this.api.get<{ data: ActivityLog[]; last_page: number; total: number }>('/activity', {
      action: this.actionFilter,
      page: this.page,
      per_page: 20,
    }).subscribe((res) => {
      this.logs = res.data;
      this.meta.last_page = res.last_page;
      this.meta.total = res.total;
    });
  }

  go(p: number): void {
    this.page = p;
    this.load();
  }
}
