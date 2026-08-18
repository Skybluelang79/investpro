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
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Profit Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_profit) }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Bonus Paid</div>
          <div class="stat-value mono">{{ api.money(data.total_bonus_paid) }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label muted">Total Referrals</div>
          <div class="stat-value mono">{{ data.total_referrals }}</div>
        </div>
      </div>

      <!-- Pending Actions -->
      <div class="grid-3 mb-2">
        <div class="card alert-card pending">
          <div class="alert-icon">&#9203;</div>
          <div>
            <h3 class="alert-title">Pending Deposits</h3>
            <div class="alert-count mono">{{ data.pending_deposits }}</div>
          </div>
          <a routerLink="/admin/deposits" class="btn btn-sm btn-primary">Review</a>
        </div>

        <div class="card alert-card pending">
          <div class="alert-icon">&#128179;</div>
          <div>
            <h3 class="alert-title">Pending Withdrawals</h3>
            <div class="alert-count mono">{{ data.pending_withdrawals }}</div>
          </div>
          <a routerLink="/admin/withdrawals" class="btn btn-sm btn-primary">Review</a>
        </div>

        <div class="card alert-card pending">
          <div class="alert-icon">&#128274;</div>
          <div>
            <h3 class="alert-title">Pending KYC</h3>
            <div class="alert-count mono">{{ data.pending_kyc }}</div>
          </div>
          <a routerLink="/admin/kyc" class="btn btn-sm btn-primary">Review</a>
        </div>
      </div>

      <!-- Cashflow Chart -->
      <div class="card mb-2">
        <h3 class="section-title mb-2">Cashflow - Last 6 Months</h3>
        <div class="chart-container">
          <svg viewBox="0 0 600 200" class="chart" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="600" y2="50" stroke="var(--card-border)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="0" y1="100" x2="600" y2="100" stroke="var(--card-border)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="0" y1="150" x2="600" y2="150" stroke="var(--card-border)" stroke-width="1" stroke-dasharray="4"/>
            <path [attr.d]="depositsPath" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
            <path [attr.d]="withdrawalsPath" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
            <path [attr.d]="revenuePath" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="8 4"/>
          </svg>
        </div>
        <div class="chart-labels">
          <span *ngFor="let point of data.chart" class="muted small">{{ point.month }}</span>
        </div>
        <div class="legend small">
          <span><i class="dot green"></i> Deposits</span>
          <span><i class="dot red"></i> Withdrawals</span>
          <span><i class="dot blue"></i> Revenue</span>
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="card mb-2" *ngIf="data.user_growth?.length">
        <h3 class="section-title mb-2">User Growth - Last 6 Months</h3>
        <div class="growth-grid">
          <div class="growth-chart">
            <svg viewBox="0 0 400 150" class="chart" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="400" y2="50" stroke="var(--card-border)" stroke-width="1" stroke-dasharray="4"/>
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--card-border)" stroke-width="1" stroke-dasharray="4"/>
              <path [attr.d]="userGrowthPath" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <div class="chart-labels">
              <span *ngFor="let g of data.user_growth" class="muted small">{{ g.month }}</span>
            </div>
          </div>
          <div class="growth-stats">
            <div *ngFor="let g of data.user_growth" class="growth-stat-row">
              <span class="muted small">{{ g.month }}</span>
              <span class="mono small">{{ g.new_users }} users</span>
              <span class="muted small">{{ g.new_investments }} investments</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan Performance -->
      <div class="card mb-2" *ngIf="data.plan_performance?.length">
        <h3 class="section-title mb-2">Plan Performance</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Rate</th>
                <th>Duration</th>
                <th>Total</th>
                <th>Active</th>
                <th>Volume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of data.plan_performance">
                <td class="fw-600">{{ p.name }}</td>
                <td class="percent-up">{{ p.interest_rate }}%</td>
                <td>{{ p.duration_days }}d</td>
                <td class="mono">{{ p.total_investments }}</td>
                <td class="mono">{{ p.active_investments }}</td>
                <td class="mono">{{ api.money(p.total_volume) }}</td>
                <td><span class="badge" [class.badge-success]="p.is_active" [class.badge-danger]="!p.is_active">{{ p.is_active ? 'Active' : 'Paused' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Health -->
      <div class="card mb-2" *ngIf="data.system_health">
        <h3 class="section-title mb-2">System Health</h3>
        <div class="grid-3">
          <div class="health-stat">
            <div class="health-label muted small">Total Transactions</div>
            <div class="health-value mono">{{ data.system_health.total_transactions }}</div>
          </div>
          <div class="health-stat">
            <div class="health-label muted small">Completed Deposits</div>
            <div class="health-value mono">{{ data.system_health.total_completed_deposits }}</div>
          </div>
          <div class="health-stat">
            <div class="health-label muted small">Completed Withdrawals</div>
            <div class="health-value mono">{{ data.system_health.total_completed_withdrawals }}</div>
          </div>
          <div class="health-stat">
            <div class="health-label muted small">KYC Verified Users</div>
            <div class="health-value mono">{{ data.system_health.kyc_verified_users }}</div>
          </div>
          <div class="health-stat">
            <div class="health-label muted small">Active Investments</div>
            <div class="health-value mono percent-up">{{ data.system_health.active_investments }}</div>
          </div>
          <div class="health-stat">
            <div class="health-label muted small">Completed Investments</div>
            <div class="health-value mono">{{ data.system_health.completed_investments }}</div>
          </div>
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
              <a [routerLink]="['/admin/users', u.id]" class="btn btn-xs btn-outline">View</a>
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

      <!-- Recent Investments -->
      <div class="card mt-2" *ngIf="data.recent_investments?.length">
        <h3 class="section-title mb-2">Recent Investments</h3>
        <div class="activity-list">
          <div *ngFor="let inv of data.recent_investments" class="activity-item">
            <div class="activity-content">
              <div class="activity-title">{{ inv.user?.name }} &mdash; {{ inv.plan?.name }}</div>
              <div class="muted small">Ref: {{ inv.reference }}</div>
            </div>
            <div class="mono percent-up">{{ api.money(inv.amount) }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card mt-2">
        <h3 class="section-title mb-2">Quick Actions</h3>
        <div class="quick-actions-grid">
          <a routerLink="/admin/users" class="action-card">
            <div class="action-icon">&#128101;</div>
            <div class="action-label">Manage Users</div>
          </a>
          <a routerLink="/admin/plans" class="action-card">
            <div class="action-icon">&#128200;</div>
            <div class="action-label">Investment Plans</div>
          </a>
          <a routerLink="/admin/deposits" class="action-card">
            <div class="action-icon">&#128176;</div>
            <div class="action-label">Deposits</div>
          </a>
          <a routerLink="/admin/withdrawals" class="action-card">
            <div class="action-icon">&#128179;</div>
            <div class="action-label">Withdrawals</div>
          </a>
          <a routerLink="/admin/kyc" class="action-card">
            <div class="action-icon">&#128274;</div>
            <div class="action-label">KYC Verification</div>
          </a>
          <a routerLink="/admin/reports" class="action-card">
            <div class="action-icon">&#128202;</div>
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
    .dot.blue { background: #2563eb; }
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
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--card-border); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 10px; border-bottom: 1px solid var(--card-border); }
    .fw-600 { font-weight: 600; }
    .growth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .growth-stats { display: flex; flex-direction: column; gap: 6px; }
    .growth-stat-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--card-border); }
    .growth-stat-row:last-child { border-bottom: none; }
    .health-stat { padding: 12px; border: 1px solid var(--card-border); border-radius: 8px; }
    .health-label { margin-bottom: 4px; }
    .health-value { font-size: 20px; font-weight: 700; }
    .small { font-size: 12px; }
  `],
})
export class AdminDashboardComponent {
  api = inject(ApiService);
  data?: AdminDashboardData;

  ngOnInit(): void {
    this.api.get<AdminDashboardData>('/admin/dashboard').subscribe((res) => (this.data = res));
  }

  private pathFor(key: 'deposits' | 'withdrawals' | 'revenue', viewBoxWidth = 600, viewBoxHeight = 200): string {
    const values = this.data?.chart?.map((c) => c[key]) ?? [];
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    const padding = 15;
    return 'M' + values.map((v, i) => `${(i / (values.length - 1)) * viewBoxWidth},${(viewBoxHeight - padding) - (v / max) * (viewBoxHeight - padding * 2)}`).join(' L');
  }

  private pathForGrowth(): string {
    const values = this.data?.user_growth?.map((g) => g.new_users) ?? [];
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    return 'M' + values.map((v, i) => `${(i / (values.length - 1)) * 400},${135 - (v / max) * 120}`).join(' L');
  }

  get depositsPath(): string {
    return this.pathFor('deposits');
  }

  get withdrawalsPath(): string {
    return this.pathFor('withdrawals');
  }

  get revenuePath(): string {
    return this.pathFor('revenue');
  }

  get userGrowthPath(): string {
    return this.pathForGrowth();
  }
}
