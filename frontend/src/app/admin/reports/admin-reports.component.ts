import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ReportData, InvestmentPlan } from '../../core/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Admin Reports</h1>

    <div class="grid-3 mb-2">
      <div class="card metric-card">
        <div class="metric-label">Total Users</div>
        <div class="metric-value mono">{{ stats?.total_users || 0 }}</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Total Investment Value</div>
        <div class="metric-value mono">{{ api.money(stats?.total_invested_value || 0) }}</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Platform Profit</div>
        <div class="metric-value mono percent-up">{{ api.money(stats?.total_platform_profit || 0) }}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 class="section-title mb-2">Investment Distribution by Plan</h3>
        <div class="plan-distribution">
          <div *ngFor="let plan of stats?.plan_distribution" class="plan-item">
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-bar">
              <div class="bar-fill" [style.width.%]="plan.percentage"></div>
            </div>
            <div class="plan-stats">
              <span class="mono">{{ plan.count }} investments</span>
              <span class="mono">{{ api.money(plan.total_amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title mb-2">KYC Status</h3>
        <div class="kyc-stats">
          <div class="kyc-item">
            <div class="status-dot verified"></div>
            <div>
              <div class="kyc-label">Verified</div>
              <div class="kyc-count">{{ stats?.kyc_verified || 0 }}</div>
            </div>
          </div>
          <div class="kyc-item">
            <div class="status-dot pending"></div>
            <div>
              <div class="kyc-label">Pending</div>
              <div class="kyc-count">{{ stats?.kyc_pending || 0 }}</div>
            </div>
          </div>
          <div class="kyc-item">
            <div class="status-dot rejected"></div>
            <div>
              <div class="kyc-label">Rejected</div>
              <div class="kyc-count">{{ stats?.kyc_rejected || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-2">
      <h3 class="section-title mb-2">Export Reports</h3>
      <div class="export-buttons">
        <button class="btn btn-outline" (click)="exportUsers()">Export Users</button>
        <button class="btn btn-outline" (click)="exportTransactions()">Export Transactions</button>
        <button class="btn btn-outline" (click)="exportInvestments()">Export Investments</button>
        <button class="btn btn-outline" (click)="exportDeposits()">Export Deposits</button>
      </div>
    </div>
  `,
  styles: [
    `
      .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .page-title { font-size: 20px; font-weight: 800; }
      .metric-label { font-size: 12px; }
      .metric-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
      .section-title { font-size: 15px; font-weight: 700; }
      .admin-controls { display: flex; gap: 10px; flex-wrap: wrap; }
      .plan-item { padding: 10px 0; border-bottom: 1px solid var(--card-border); }
      .plan-item:last-child { border-bottom: none; }
      .plan-name { font-weight: 600; margin-bottom: 6px; }
      .plan-bar { height: 8px; background: var(--card-border); border-radius: 4px; margin-bottom: 6px; }
      .bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }
      .plan-stats { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
      .kyc-stats { display: flex; flex-direction: column; gap: 14px; }
      .kyc-item { display: flex; align-items: center; gap: 10px; }
      .status-dot { width: 10px; height: 10px; border-radius: 50%; }
      .status-dot.verified { background: var(--success, #22c55e); }
      .status-dot.pending { background: var(--warning, #f59e0b); }
      .status-dot.rejected { background: var(--danger, #ef4444); }
      .kyc-label { font-size: 13px; color: var(--text-muted); }
      .kyc-count { font-size: 20px; font-weight: 700; }
      .export-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
    `,
  ],
})
export class AdminReportsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);
  data?: ReportData;
  stats?: {
    total_users: number;
    total_invested_value: number;
    total_platform_profit: number;
    plan_distribution: { name: string; count: number; total_amount: number; percentage: number }[];
    kyc_verified: number;
    kyc_pending: number;
    kyc_rejected: number;
  };
  from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api
      .get<ReportData>('/admin/reports', { from: this.from, to: this.to })
      .subscribe((res) => (this.data = res));
    this.api
      .get<{ total_users: number; total_invested_value: number; total_platform_profit: number; plan_distribution: { name: string; count: number; total_amount: number; percentage: number }[]; kyc_verified: number; kyc_pending: number; kyc_rejected: number }>('/admin/reports/stats')
      .subscribe((res) => (this.stats = res));
  }

  exportUsers(): void {
    window.open('/api/admin/export/users', '_blank');
  }

  exportTransactions(): void {
    window.open('/api/admin/export/transactions', '_blank');
  }

  exportInvestments(): void {
    window.open('/api/admin/export/investments', '_blank');
  }

  exportDeposits(): void {
    window.open('/api/admin/export/deposits', '_blank');
  }
}
