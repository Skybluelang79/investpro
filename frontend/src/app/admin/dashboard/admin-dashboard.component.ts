import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AdminDashboardData } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1 class="page-title mb-2">Admin Dashboard</h1>

    <div *ngIf="!data" class="loading">Loading admin dashboard...</div>

    <ng-container *ngIf="data">
      <!-- Platform Overview -->
      <div class="card mb-2 platform-card">
        <div class="platform-header">
          <div>
            <div class="muted small">Total Platform Balance</div>
            <div class="balance mono">{{ api.money(data.total_balance) }}</div>
          </div>
          <div class="platform-status">
            <span class="badge badge-success">Active</span>
            <div class="muted small mt-1">{{ data.total_users }} users</div>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid-4 mb-2">
        <div class="card stat-card">
          <div class="stat-label muted">Total Invested</div>
          <div class="stat-value mono">{{ api.money(data.total_invested) }}</div>
          <div class="stat-change percent-up">↑ 12.5%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Profit Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_profit) }}</div>
          <div class="stat-change percent-up">↑ 8.2%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Bonus Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_bonus_paid) }}</div>
          <div class="stat-change percent-down">↓ 2.1%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Total Referrals</div>
          <div class="stat-value mono">{{ data.total_referrals }}</div>
          <div class="stat-change percent-up">↑ 5.8%</div>
        </div>
      </div>

      <!-- Pending Actions -->
      <div class="grid-2 mb-2">
        <div class="card alert-card pending">
          <div class="alert-icon">⏳</div>
          <div>
            <h3 class="alert-title">Pending Deposits</h3>
            <div class="alert-count mono">{{ data.pending_deposits }}</div>
            <p class="muted small">Awaiting approval</p>
          </div>
          <a routerLink="/admin/deposits" class="btn btn-sm btn-primary">Review</a>
        </div>

        <div class="card alert-card pending">
          <div class="alert-icon">💳</div>
          <div>
            <h3 class="alert-title">Pending Withdrawals</h3>
            <div class="alert-count mono">{{ data.pending_withdrawals }}</div>
            <p class="muted small">Awaiting processing</p>
          </div>
          <a routerLink="/admin/withdrawals" class="btn btn-sm btn-primary">Review</a>
        </div>
      </div>

      <!-- Cashflow Chart -->
      <div class="card mb-2">
        <h3 class="section-title mb-2">Cashflow - Last 6 Months</h3>
        <div class="chart-container">
          <svg viewBox="0 0 600 200" class="chart" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="600" y2="50" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="0" y1="100" x2="600" y2="100" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="0" y1="150" x2="600" y2="150" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4"/>
            <path [attr.d]="depositsPath" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
            <path [attr.d]="withdrawalsPath" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
          </svg>
        </div>
        <div class="chart-labels">
          <span *ngFor="let point of data.chart" class="muted small">{{ point.month }}</span>
        </div>
        <div class="legend small">
          <span><i class="dot green"></i> Deposits</span>
          <span><i class="dot red"></i> Withdrawals</span>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid-2">
        <div class="card">
          <h3 class="section-title mb-2">Recent Users</h3>
          <div class="activity-list">
            <div *ngFor="let u of data.recent_users" class="activity-item">
              <div class="activity-content">
                <div class="activity-title">{{ u.name }}</div>
                <div class="muted small">{{ u.email }}</div>
                <div class="muted small">{{ u.created_at | date: 'mediumDate' }}</div>
              </div>
              <a routerLink="/admin/users" class="btn btn-xs btn-outline">View</a>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title mb-2">Recent Deposits</h3>
          <div class="activity-list">
            <div *ngFor="let d of data.recent_deposits" class="activity-item">
              <div class="activity-content">
                <div class="activity-title">{{ d.user?.name }}</div>
                <div class="muted small">{{ d.reference }}</div>
                <div class="muted small" [class]="'badge-' + d.status">{{ d.status }}</div>
              </div>
              <div class="mono percent-up">{{ api.money(d.amount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Quick Actions -->
      <div class="card mt-2">
        <h3 class="section-title mb-2">Quick Actions</h3>
        <div class="quick-actions-grid">
          <a routerLink="/admin/users" class="action-card">
            <div class="action-icon">👥</div>
            <div class="action-label">Manage Users</div>
          </a>
          <a routerLink="/admin/plans" class="action-card">
            <div class="action-icon">📊</div>
            <div class="action-label">Investment Plans</div>
          </a>
          <a routerLink="/admin/deposits" class="action-card">
            <div class="action-icon">💰</div>
            <div class="action-label">Deposits</div>
          </a>
          <a routerLink="/admin/withdrawals" class="action-card">
            <div class="action-icon">💳</div>
            <div class="action-label">Withdrawals</div>
          </a>
          <a routerLink="/admin/kyc" class="action-card">
            <div class="action-icon">🔐</div>
            <div class="action-label">KYC Verification</div>
          </a>
          <a routerLink="/admin/reports" class="action-card">
            <div class="action-icon">📈</div>
            <div class="action-label">Reports</div>
          </a>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .balance { font-size: 34px; font-weight: 800; margin-top: 6px; }
    .platform-card .platform-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .platform-status { text-align: right; }
    .stat-label { font-size: 12px; }
    .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .stat-card { position: relative; }
    .stat-change { font-size: 12px; margin-top: 4px; }
    .alert-card { display: flex; align-items: center; gap: 14px; }
    .alert-card .btn { margin-left: auto; flex-shrink: 0; }
    .alert-icon { font-size: 28px; }
    .alert-title { font-size: 14px; font-weight: 600; margin: 0; }
    .alert-count { font-size: 22px; font-weight: 700; }
    .chart-container { position: relative; }
    .chart { width: 100%; height: 160px; display: block; }
    .chart-labels { display: flex; justify-content: space-between; }
    .legend { display: flex; gap: 16px; margin-top: 8px; color: var(--text-muted); }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
    .dot.green { background: #22c55e; }
    .dot.red { background: #ef4444; }
    .section-title { font-size: 15px; font-weight: 700; }
    .activity-list { display: flex; flex-direction: column; }
    .activity-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--card-border); }
    .activity-item:last-child { border-bottom: none; }
    .activity-title { font-weight: 600; }
    .activity-content { display: flex; flex-direction: column; gap: 2px; }
    .quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; border-radius: 8px; text-align: center; text-decoration: none; color: inherit; border: 1px solid var(--card-border); transition: background .15s; }
    .action-card:hover { background: var(--card-border); }
    .action-icon { font-size: 24px; }
    .action-label { font-size: 12px; font-weight: 600; }
  `],
})
export class AdminDashboardComponent {
  api = inject(ApiService);
  data?: AdminDashboardData;

  ngOnInit(): void {
    this.api.get<AdminDashboardData>('/admin/dashboard').subscribe((res) => (this.data = res));
  }

  private pathFor(key: 'deposits' | 'withdrawals'): string {
    const values = this.data?.chart?.map((c) => c[key]) ?? [];
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    return 'M' + values.map((v, i) => `${(i / (values.length - 1)) * 600},${195 - (v / max) * 180}`).join(' L');
  }

  get depositsPath(): string {
    return this.pathFor('deposits');
  }

  get withdrawalsPath(): string {
    return this.pathFor('withdrawals');
  }
}
