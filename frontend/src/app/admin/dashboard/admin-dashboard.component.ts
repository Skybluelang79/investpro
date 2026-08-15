import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AdminDashboardData } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!data" class="loading">Loading admin dashboard...</div>

    <ng-container *ngIf="data">
      <div class="card mb-2">
        <div class="muted small">Total Platform Balance</div>
        <div class="balance mono">{{ api.money(data.total_balance) }}</div>
      </div>

      <div class="grid-4">
        <div class="card stat">
          <div class="stat-label muted">Invested</div>
          <div class="stat-value mono">{{ api.money(data.total_invested) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Profit Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_profit) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Bonus Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_bonus_paid) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Referrals</div>
          <div class="stat-value mono">{{ data.total_referrals }}</div>
        </div>
      </div>

      <div class="grid-2 mt-2">
        <div class="card">
          <div class="muted small mb-1">Pending Deposits</div>
          <div class="stat-value mono">{{ data.pending_deposits }}</div>
          <a routerLink="/admin/deposits" class="btn btn-outline btn-sm mt-1">Review deposits</a>
        </div>
        <div class="card">
          <div class="muted small mb-1">Pending Withdrawals</div>
          <div class="stat-value mono">{{ data.pending_withdrawals }}</div>
          <a routerLink="/admin/withdrawals" class="btn btn-outline btn-sm mt-1">Review withdrawals</a>
        </div>
      </div>

      <div class="card mt-2">
        <div class="muted small mb-1">Cashflow (6 months)</div>
        <svg viewBox="0 0 600 200" class="chart" preserveAspectRatio="none">
          <path [attr.d]="depositsPath" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
          <path [attr.d]="withdrawalsPath" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
        </svg>
        <div class="chart-labels">
          <span *ngFor="let point of data.chart" class="muted small">{{ point.month }}</span>
        </div>
        <div class="legend small">
          <span><i class="dot green"></i> Deposits</span>
          <span><i class="dot red"></i> Withdrawals</span>
        </div>
      </div>

      <div class="grid-2 mt-2">
        <div class="card">
          <h3 class="section-title mb-1">Recent Users</h3>
          <div *ngFor="let u of data.recent_users" class="row-item">
            <div>
              <div class="row-title">{{ u.name }}</div>
              <div class="muted small">{{ u.email }}</div>
            </div>
            <div class="muted small">{{ u.created_at | date: 'mediumDate' }}</div>
          </div>
        </div>
        <div class="card">
          <h3 class="section-title mb-1">Recent Deposits</h3>
          <div *ngFor="let d of data.recent_deposits" class="row-item">
            <div>
              <div class="row-title">{{ d.user?.name }}</div>
              <div class="muted small">{{ d.reference }}</div>
            </div>
            <div class="mono percent-up">{{ api.money(d.amount) }}</div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .balance { font-size: 34px; font-weight: 800; margin-top: 6px; }
    .stat-label { font-size: 12px; }
    .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .chart { width: 100%; height: 160px; display: block; }
    .chart-labels { display: flex; justify-content: space-between; }
    .legend { display: flex; gap: 16px; margin-top: 8px; color: var(--text-muted); }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
    .dot.green { background: #22c55e; }
    .dot.red { background: #ef4444; }
    .section-title { font-size: 15px; font-weight: 700; }
    .row-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--card-border); }
    .row-item:last-child { border-bottom: none; }
    .row-title { font-weight: 600; }
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
