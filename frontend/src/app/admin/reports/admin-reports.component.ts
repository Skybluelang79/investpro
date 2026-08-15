import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ReportData } from '../../core/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <div>
        <h1 class="page-title">Reports</h1>
        <div class="muted small">View platform cashflow, profits, and referral activity.</div>
      </div>
      <div class="form-inline">
        <label>
          From
          <input class="input" type="date" [(ngModel)]="from" (change)="load()" />
        </label>
        <label>
          To
          <input class="input" type="date" [(ngModel)]="to" (change)="load()" />
        </label>
        <button class="btn btn-primary btn-sm" (click)="load()">Refresh</button>
      </div>
    </div>

    <div *ngIf="!data" class="loading">Loading reports...</div>

    <ng-container *ngIf="data">
      <div class="grid-4">
        <div class="card stat">
          <div class="stat-label muted">Deposits</div>
          <div class="stat-value mono">{{ api.money(data.deposits) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Withdrawals</div>
          <div class="stat-value mono">{{ api.money(data.withdrawals) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Profit Paid</div>
          <div class="stat-value mono">{{ api.money(data.profit_paid) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Referral Bonus Paid</div>
          <div class="stat-value mono">{{ api.money(data.referral_bonus_paid) }}</div>
        </div>
      </div>

      <div class="grid-3 mt-2">
        <div class="card">
          <div class="muted small">Net Cashflow</div>
          <div class="stat-value mono">{{ api.money(data.net_cashflow) }}</div>
        </div>
        <div class="card">
          <div class="muted small">New Users</div>
          <div class="stat-value">{{ data.new_users }}</div>
        </div>
        <div class="card">
          <div class="muted small">New Investments</div>
          <div class="stat-value">{{ data.new_investments }}</div>
        </div>
      </div>

      <div class="card mt-2">
        <h3 class="section-title mb-1">Transactions by type</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Total</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of data.transactions_by_type">
              <td>{{ item.type }}</td>
              <td class="mono">{{ api.money(item.total) }}</td>
              <td>{{ item.count }}</td>
            </tr>
            <tr *ngIf="data.transactions_by_type.length === 0">
              <td colspan="3" class="empty">No transaction data available.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .form-inline { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
      .form-inline label { display: flex; flex-direction: column; gap: 4px; }
      .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .page-title { font-size: 20px; font-weight: 800; }
      .stat-label { font-size: 12px; }
      .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
      .section-title { font-size: 15px; font-weight: 700; }
    `,
  ],
})
export class AdminReportsComponent {
  api = inject(ApiService);
  data?: ReportData;
  from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api
      .get<ReportData>('/admin/reports', { from: this.from, to: this.to })
      .subscribe((res) => (this.data = res));
  }
}
